// FickCalculator.tsx
import React, { useState } from "react";
import "./ios-font.css";
import "./theme.css";
import { motion, AnimatePresence } from "framer-motion";

function calculateVO2(age: number, hr: number): number {
  const vo2 = 138.1 - 11.49 * Math.log(age) + 0.378 * hr;
  return parseFloat(vo2.toFixed(2));
}

function calculateO2Content(
  hgb: number,
  sat: number,
  paO2: number = 100,
  includeDissolved: boolean = false
): number {
  const bound = 1.36 * hgb * (sat / 100);
  const dissolved = 0.0031 * paO2;
  return parseFloat((bound + (includeDissolved ? dissolved : 0)).toFixed(2));
}

function FickCalculator() {
  const emptyState = {
    age: "",
    hr: "",
    hgb: "",
    saO2: "",
    svO2: "",
    pvO2: "",
    paO2: "",
    paO2mmHg: "",
    pvO2mmHg: "",
    meanPAP: "",
    pcwp: "",
    bsa: "",
    includeDissolved: false,
    useManualVO2: false,
    manualVO2: "",
  };

  const [state, setState] = useState<typeof emptyState>(emptyState);
  const [darkMode, setDarkMode] = useState(true);

  const resetAll = () => setState({ ...emptyState });

  const updateField = (field: string, value: any) => {
    setState((prev) => ({ ...prev, [field]: value === "" ? "" : +value }));
  };

  const vo2 = state.useManualVO2
    ? Number(state.manualVO2 || 0)
    : calculateVO2(Number(state.age || 0), Number(state.hr || 0));

  const caO2 = calculateO2Content(
    Number(state.hgb || 0),
    Number(state.saO2 || 0),
    Number(state.paO2mmHg || 0),
    state.includeDissolved
  );
  const cvO2 = calculateO2Content(
    Number(state.hgb || 0),
    Number(state.svO2 || 0),
    Number(state.paO2mmHg || 0),
    state.includeDissolved
  );
  const cpvO2 = calculateO2Content(
    Number(state.hgb || 0),
    Number(state.pvO2 || 0),
    Number(state.pvO2mmHg || 0),
    state.includeDissolved
  );
  const cpaO2 = calculateO2Content(
    Number(state.hgb || 0),
    Number(state.paO2 || 0),
    Number(state.paO2mmHg || 0),
    state.includeDissolved
  );

  const CO = vo2 / (caO2 - cvO2 || 1);
  const Qp = vo2 / (cpvO2 - cpaO2 || 1);
  const Qs = vo2 / (caO2 - cvO2 || 1);
  const QpQs = Qs !== 0 ? Qp / Qs : 0;
  const TPG = Number(state.meanPAP || 0) - Number(state.pcwp || 0);
  const PVRi = TPG / (Qp || 1);

  const takeScreenshot = () => window.print();
  const labelTextClass = darkMode ? "text-white" : "text-black";

  const inputFields = [
    ["Hemoglobin (g/dL)", "hgb", "g/dL"],
    ["Arterial O₂ Sat (%)", "saO2", "%"],
    ["Venous O₂ Sat (%)", "svO2", "%"],
    ["PA O₂ Sat (%)", "paO2", "%"],
    ["PV O₂ Sat (%)", "pvO2", "%"],
    ...(state.includeDissolved
      ? [
          ["PAO₂ (mmHg)", "paO2mmHg", "mmHg"],
          ["PVO₂ (mmHg)", "pvO2mmHg", "mmHg"],
        ]
      : []),
    ["Mean PAP (mmHg)", "meanPAP", "mmHg"],
    ["PCWP (mmHg)", "pcwp", "mmHg"],
    ["BSA (m²)", "bsa", "m²"],
  ];

  return (
    <div
      className={`p-4 max-w-xl mx-auto space-y-4 font-sf min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-dark text-white" : "bg-white text-black"
      }`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-2xl font-bold">Fick Calculator</h1>
        <label className="flex items-center space-x-2 cursor-pointer">
          <span className="text-sm">🌞</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <span className="text-sm">🌙</span>
        </label>
      </motion.div>

      <AnimatePresence>
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className={`card ${darkMode ? "card-dark" : "card-light"}`}>
            <input
              type="checkbox"
              checked={state.includeDissolved}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  includeDissolved: e.target.checked,
                }))
              }
            />
            <label className={`ml-2 ${labelTextClass}`}>
              Include Dissolved O₂ (0.0031 × PaO₂)
            </label>
          </div>

          <div className={`card ${darkMode ? "card-dark" : "card-light"}`}>
            <input
              type="checkbox"
              checked={state.useManualVO2}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  useManualVO2: e.target.checked,
                }))
              }
            />
            <label className={`ml-2 ${labelTextClass}`}>Use Manual VO₂</label>
          </div>

          {state.useManualVO2 && (
            <div className={`card ${darkMode ? "card-dark" : "card-light"}`}>
              <label className={`block ${labelTextClass}`}>
                Manual VO₂ (mL/min/m²)
              </label>
              <input
                type="number"
                value={state.manualVO2}
                onChange={(e) => updateField("manualVO2", e.target.value)}
                className={`input w-full ${
                  darkMode ? "input-dark" : "input-light"
                }`}
                placeholder="mL/min/m²"
              />
            </div>
          )}

          {!state.useManualVO2 && (
            <>
              <div className={`card ${darkMode ? "card-dark" : "card-light"}`}>
                <label className={`block ${labelTextClass}`}>Age (years)</label>
                <input
                  type="number"
                  value={state.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  className={`input w-full ${
                    darkMode ? "input-dark" : "input-light"
                  }`}
                  placeholder="yrs"
                />
              </div>
              <div className={`card ${darkMode ? "card-dark" : "card-light"}`}>
                <label className={`block ${labelTextClass}`}>
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={state.hr}
                  onChange={(e) => updateField("hr", e.target.value)}
                  className={`input w-full ${
                    darkMode ? "input-dark" : "input-light"
                  }`}
                  placeholder="bpm"
                />
              </div>
            </>
          )}

          {inputFields.map(([labelText, key, placeholder], i) => (
            <div
              className={`card ${darkMode ? "card-dark" : "card-light"}`}
              key={i}
            >
              <label className={`block ${labelTextClass}`}>{labelText}</label>
              <input
                type="number"
                value={state[key as keyof typeof state] as number | ""}
                onChange={(e) => updateField(key as string, e.target.value)}
                className={`input w-full ${
                  darkMode ? "input-dark" : "input-light"
                }`}
                placeholder={placeholder as string}
              />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="mt-6 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="result-card">
          Estimated VO₂ (mL/min/m²): <strong>{vo2}</strong>
        </div>
        <div className="result-card">
          Cardiac Output (L/min): <strong>{CO.toFixed(2)}</strong>
        </div>
        <div className="result-card">
          Qp (L/min): <strong>{Qp.toFixed(2)}</strong>
        </div>
        <div className="result-card">
          Qp:Qs Ratio: <strong>{QpQs.toFixed(2)}</strong>
        </div>
        <div className="result-card">
          Transpulmonary Gradient (mmHg): <strong>{TPG.toFixed(1)}</strong>
        </div>
        <div className="result-card">
          PVR Index (Wood units·m²): <strong>{PVRi.toFixed(2)}</strong>
        </div>
      </motion.div>

      <div className="pt-4 flex gap-4">
        <button
          onClick={takeScreenshot}
          className="bg-blue-600 text-black px-4 py-2 rounded shadow"
        >
          📸 Save Screenshot
        </button>
        <button
          onClick={resetAll}
          className="bg-red-600 text-black px-4 py-2 rounded shadow"
        >
          🔄 Reset All
        </button>
      </div>
    </div>
  );
}

export default FickCalculator;
