import { useState } from 'react';

const steps = [
  'Name environment',
  'Draw room perimeter',
  'Place sensing nodes',
  'Empty room baseline recording',
  'Walk perimeter calibration',
  'Mark calibration points',
  'Review calibration data',
  'Save',
];

export default function CalibrationWizard({ onFinish }) {
  const [step, setStep] = useState(0);
  return (
    <section className="page-layout carbon-panel wizard">
      <h2 className="gold-bright-text">Calibration Wizard</h2>
      <div className="wizard-steps">
        {steps.map((label, index) => (
          <div key={label} className={`wizard-step ${index === step ? 'active' : ''}`}>{index + 1}. {label}</div>
        ))}
      </div>
      <div className="carbon-panel-inner wizard-content">
        <p>{steps[step]}</p>
        <progress max={steps.length - 1} value={step} />
      </div>
      <div className="action-row">
        <button className="btn-carbon" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>Back</button>
        {step < steps.length - 1 ? <button className="btn-carbon" onClick={() => setStep((value) => value + 1)}>Next</button> : <button className="btn-carbon" onClick={onFinish}>Finish</button>}
      </div>
    </section>
  );
}
