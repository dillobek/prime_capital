'use client';
import { useState } from 'react';
import type { Balance } from '@prime/contracts';

const apiUrl = '/api';

export function BalanceEditor({ initialBalances }: { initialBalances: Balance[] }) {
  const [values, setValues] = useState(initialBalances);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const update = (index: number, field: 'amount' | 'monthlyChange', value: number) => {
    setStatus('idle');
    setValues((current) => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };
  const save = async () => {
    setStatus('saving');
    try {
      const responses = await Promise.all(values.map((balance) => fetch(`${apiUrl}/balances/${balance.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: balance.amount, monthlyChange: balance.monthlyChange }),
      })));
      if (responses.some((response) => !response.ok)) throw new Error('Save failed');
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };
  const buttonText = status === 'saving' ? 'Saqlanmoqda…' : status === 'saved' ? 'Saqlandi ✓' : status === 'error' ? 'Qayta urinish' : 'Saqlash';
  return <section className="balance-editor panel"><h2>Tezkor balans tahrirlash</h2>
    {values.map((balance, index) => <div className="balance-form" key={balance.id}>
      <strong>{balance.name}</strong><div className="form-row">
        <label>Joriy balans ($)<input value={balance.amount} type="number" onChange={(e) => update(index, 'amount', Number(e.target.value))}/></label>
        <label>O‘zgarish (%)<input value={balance.monthlyChange} type="number" step="0.1" onChange={(e) => update(index, 'monthlyChange', Number(e.target.value))}/></label>
      </div></div>)}
    <button className="save" disabled={status === 'saving'} onClick={save}>{buttonText}</button>
    {status === 'error' && <small className="save-error">API bilan aloqa bo‘lmadi.</small>}
  </section>;
}
