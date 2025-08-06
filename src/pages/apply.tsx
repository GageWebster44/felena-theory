import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';

function ApplyPage() {
export default withGuardianGate(Page);
  const [form, setForm] = useState({
    name: '',
    email: '',
    github: '',
    skills: '',
    why: '',
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    alert('Application submitted. You will be contacted if selected.');
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className="text-3xl font-bold text-center text-green-400">APPLY TO FELENA THEORY</h1>
      <p className="mt-4 text-center text-lg text-red-500 font-mono">
        ⚠️ THIS IS A ONE-SHOT ENTRY INTO A CLOSED SYSTEM
      </p>
      <p className="mt-2 text-center text-sm text-gray-300 font-mono">
        If chosen, you will become part of a classified architecture designed to outpace the financial system.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-xl mx-auto space-y-4 font-mono">
        <input
          className={styles.crtInput}
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className={styles.crtInput}
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className={styles.crtInput}
          type="text"
          name="github"
          placeholder="GitHub / Portfolio"
          value={form.github}
          onChange={handleChange}
        />
        <textarea
          className={styles.crtInput}
          name="skills"
          placeholder="What are your technical skills?"
          rows={2}
          value={form.skills}
          onChange={handleChange}
          required
        />
        <textarea
          className={styles.crtInput}
          name="why"
          placeholder="Why do you deserve to be a part of this system?"
          rows={3}
          value={form.why}
          onChange={handleChange}
          required
        />
        <button type="submit" className={`${styles.crtButton} w-full`}>
          SUBMIT APPLICATION
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-yellow-300 font-mono">
        <p>
          You are not applying for a job. You're applying for purpose. Autonomy. An identity inside a post-system world.
        </p>
        <p className="mt-2">
          This opportunity will not be repeated. Once the gate closes, it’s sealed for good.
        </p>
        <p className="mt-4 text-pink-500">
          Do not apply lightly. If accepted, everything changes.
        </p>
      </div>
    </div>
  );
}