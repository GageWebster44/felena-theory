import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { updateXP, logXP } from '@/utils/xpEngine';

const questions = [
  { q: 'What is 3 + 4?', options: ['5', '6', '7', '8'], answer: '7' },
  { q: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Venus', 'Jupiter'], answer: 'Mars' },
  { q: 'How many legs does a spider have?', options: ['6', '8', '10', '12'], answer: '8' },

  // Trade-aligned questions
  { q: 'What is standard voltage for outlets in US homes?', options: ['110V', '220V', '240V', '12V'], answer: '110V' },
  { q: 'What tool is used for smoothing drywall seams?', options: ['Speed Square', 'Chalk Line', 'Trowel', 'Hammer'], answer: 'Trowel' },
  { q: 'What is the purpose of rebar in concrete?', options: ['Waterproofing', 'Color', 'Strength', 'Texture'], answer: 'Strength' },
  { q: 'Which pipe is most common in plumbing today?', options: ['Copper', 'PVC', 'Rubber', 'Steel'], answer: 'PVC' },
  { q: 'What tool is used to cut asphalt shingles?', options: ['Utility knife', 'Pliers', 'Wrench', 'Saw'], answer: 'Utility knife' },
  { q: 'Which layer of skin do tattoos go into?', options: ['Epidermis', 'Dermis', 'Subcutaneous', 'Fat'], answer: 'Dermis' },
  { q: 'Which tool trims split ends in cosmetology?', options: ['Brush', 'Flat iron', 'Shears', 'Comb'], answer: 'Shears' },
  { q: 'What part of a vehicle helps it stop?', options: ['Engine', 'Exhaust', 'Brakes', 'Alternator'], answer: 'Brakes' },
  { q: 'What machine uses a rotating bit to cut parts?', options: ['Lathe', 'Drill', 'CNC', 'Router'], answer: 'CNC' },
  { q: 'What ingredient makes bread rise?', options: ['Flour', 'Salt', 'Yeast', 'Sugar'], answer: 'Yeast' },
  { q: 'What does a barber primarily work on?', options: ['Shoes', 'Hair', 'Walls', 'Clothing'], answer: 'Hair' },
  { q: 'What type of saw is used in carpentry?', options: ['Bone saw', 'Table saw', 'Hacksaw', 'Jigsaw'], answer: 'Table saw' },
  { q: 'What age group is childcare focused on?', options: ['Teens', 'Infants', 'Seniors', 'Adults'], answer: 'Infants' },
  { q: 'What color is often used for electrical ground?', options: ['Red', 'White', 'Green', 'Black'], answer: 'Green' },
  { q: 'Which system handles home temperature?', options: ['HVAC', 'Plumbing', 'Roofing', 'Electrical'], answer: 'HVAC' },
  { q: 'What tool cuts grass evenly?', options: ['Chainsaw', 'Lawnmower', 'Tiller', 'Shovel'], answer: 'Lawnmower' },
  { q: 'Which job involves painting walls and trim?', options: ['Plumber', 'Painter', 'Electrician', 'Barber'], answer: 'Painter' },
  { q: 'Which system uses water pressure?', options: ['Electrical', 'Plumbing', 'Roofing', 'HVAC'], answer: 'Plumbing' },
  { q: 'What material covers most rooftops?', options: ['Vinyl', 'Shingles', 'Drywall', 'Plywood'], answer: 'Shingles' },
  { q: 'Which role helps keep people safe at events?', options: ['Mechanic', 'Security Guard', 'Carpenter', 'Chef'], answer: 'Security Guard' },
  { q: 'What license is needed to drive big trucks?', options: ['CDL', 'CPA', 'NRA', 'RPG'], answer: 'CDL' },
  { q: 'What tool is used in welding?', options: ['Torch', 'Drill', 'Ladder', 'Stapler'], answer: 'Torch' },
];

function XPQuizGame() {
export default withGuardianGate(Page);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const current = questions[index];

  const handleAnswer = async (option: string) => {
    if (disabled) return;
    setDisabled(true);

    const correct = option === current.answer;
    const xpGain = correct ? 3 : 0;

    if (correct) {
      await updateXP(xpGain);
      logXP('xp_quiz', xpGain, `Correct answer: ${current.q}`);
      setMessage(`✅ Correct! +${xpGain} XP`);
      setScore((prev) => prev + xpGain);
      setTotalCorrect((prev) => prev + 1);
    } else {
      setMessage('❌ Oops! That was not the right answer.');
    }

    setTimeout(() => {
      setMessage('');
      setDisabled(false);
      setIndex((prev) => (prev + 1) % questions.length);
    }, 2000);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🧠 XP QUIZ CHALLENGE</h1>
      <p>Answer real-world skill questions to earn XP. Learning = Earning!</p>

      <div style={{ margin: '1rem 0', fontSize: '1.2rem', color: '#fff' }}>{current.q}</div>

      <div className={styles.crtGridResponsive}>
        {current.options.map((opt, i) => (
          <button
            key={i}
            className={styles.crtButton}
            onClick={() => handleAnswer(opt)}
            disabled={disabled}
          >
            {opt}
          </button>
        ))}
      </div>

      {message && <p style={{ marginTop: '1rem', color: '#0ff' }}>{message}</p>}

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#aaa' }}>
        <p>Total XP Earned from Quiz: <strong>{score}</strong></p>
        <p>Correct Answers: <strong>{totalCorrect}</strong> / {questions.length}</p>
        <p>🎓 Repeat questions to reinforce memory. XP resets daily.</p>
      </div>
    </div>
  );
}