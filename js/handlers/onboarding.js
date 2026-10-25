import { state } from '../state.js';
import { $, LT, showToast } from '../utils.js';
import { persist } from '../db.js';
import { authView, onboard, show } from '../ui.js';
import { go } from '../auth.js';

export async function handleOnboardingAndAuth(t, D) {
  try {
    if (D.tab) { state.tab = D.tab; authView(); return true; }
    if (t.id === "ago") { go(); return true; }
    if (D.back !== undefined) { state.ob.step = +D.back; onboard(); return true; }
    if (D.obt) { state.ob.tipo = D.obt; state.ob.step = 1; onboard(); return true; }
    if (D.obf) { state.ob.freq = +D.obf; state.ob.step = 2; onboard(); return true; }
    if (D.obqty) { state.ob.qty = +D.obqty; state.ob.days = []; state.ob.step = 3; onboard(); return true; }
    if (D.obd !== undefined) {
      const day = +D.obd;
      if (state.ob.days.includes(day)) state.ob.days = state.ob.days.filter(d => d !== day);
      else if (state.ob.days.length < state.ob.qty) state.ob.days.push(day);
      onboard();
      return true;
    }
    if (t.id === "saveRest") {
      if (state.ob.days.length === state.ob.qty) {
        if (state.isUpdate) {
          state.P.rest = [...state.ob.days].sort();
          persist({ rest: state.P.rest });
          state.isUpdate = false;
          state.P.needRestUpdate = false;
          show();
        } else {
          state.P.tipo = state.ob.tipo;
          state.P.freq = state.ob.freq;
          state.P.rest = [...state.ob.days].sort();
          state.letter = LT()[0];
          persist();
          show();
        }
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error("handleOnboardingAndAuth:", err);
    showToast("Ocorreu um erro.", "error");
    return true;
  }
}