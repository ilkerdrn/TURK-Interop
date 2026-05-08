import { useReducer, useEffect, useCallback, useRef } from 'react';
import crisisApi from '../api/crisisApi';

// ── State shape ──────────────────────────────────────────────
const initialState = {
  crises:  [],
  summary: null,
  loading: false,
  error:   null,
  // form submit için ayrı loading/error — tablo ile karışmasın
  submitting: false,
  submitError: null
};

// ── Reducer ──────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, crises: action.crises, summary: action.summary };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error };

    case 'SUBMIT_START':
      return { ...state, submitting: true, submitError: null };
    case 'SUBMIT_SUCCESS':
      return { ...state, submitting: false };
    case 'SUBMIT_ERROR':
      return { ...state, submitting: false, submitError: action.error };
    case 'CLEAR_SUBMIT_ERROR':
      return { ...state, submitError: null };

    default:
      return state;
  }
}

// ── Hook ─────────────────────────────────────────────────────
export function useCrises(filters = {}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Filters değişince gereksiz re-fetch'i önlemek için serialize et
  const filtersKey = JSON.stringify(filters);

  // Abort controller — component unmount veya yeni fetch gelince öncekini iptal et
  const abortRef = useRef(null);

  const fetchAll = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    dispatch({ type: 'FETCH_START' });
    try {
      const [crisesRes, summaryRes] = await Promise.all([
        crisisApi.getAll(filters),
        crisisApi.getSummary()
      ]);
      dispatch({
        type: 'FETCH_SUCCESS',
        crises:  crisesRes.data?.data  ?? crisesRes.data  ?? [],
        summary: summaryRes.data
      });
    } catch (err) {
      // AbortError'ı gösterme
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        dispatch({ type: 'FETCH_ERROR', error: err.message });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  // Filtreler değişince yeniden çek
  useEffect(() => {
    fetchAll();
    return () => abortRef.current?.abort();
  }, [fetchAll]);

  // ── Mutasyonlar ───────────────────────────────────────────

  const addCrisis = async (data) => {
    dispatch({ type: 'SUBMIT_START' });
    try {
      const res = await crisisApi.create(data);
      dispatch({ type: 'SUBMIT_SUCCESS' });
      await fetchAll(); // listeyi güncelle
      return res.data;
    } catch (err) {
      dispatch({ type: 'SUBMIT_ERROR', error: err.message });
      throw err; // form'un da yakalaması için re-throw
    }
  };

  const updateCrisis = async (id, data) => {
    dispatch({ type: 'SUBMIT_START' });
    try {
      const res = await crisisApi.update(id, data);
      dispatch({ type: 'SUBMIT_SUCCESS' });
      await fetchAll();
      return res.data;
    } catch (err) {
      dispatch({ type: 'SUBMIT_ERROR', error: err.message });
      throw err;
    }
  };

  const deleteCrisis = async (id) => {
    dispatch({ type: 'SUBMIT_START' });
    try {
      await crisisApi.remove(id);
      dispatch({ type: 'SUBMIT_SUCCESS' });
      await fetchAll();
    } catch (err) {
      dispatch({ type: 'SUBMIT_ERROR', error: err.message });
      throw err;
    }
  };

  const clearSubmitError = () => dispatch({ type: 'CLEAR_SUBMIT_ERROR' });

  return {
    ...state,
    refetch: fetchAll,
    addCrisis,
    updateCrisis,
    deleteCrisis,
    clearSubmitError
  };
}
