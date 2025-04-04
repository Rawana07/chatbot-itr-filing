'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

const questions = [
  { id: 'full_name', question: "What's your full name?", type: 'text' },
  { id: 'pan_number', question: 'Enter your PAN number', type: 'text' },
  { id: 'email', question: 'Your email address?', type: 'email' },
  { id: 'income_type', question: 'What type of income do you have?', type: 'text' },
  { id: 'documents', question: 'Upload your documents (PDF, JPG)', type: 'file' }
];

export default function ChatBotPage() {
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState<File | null>(null);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [orderLink, setOrderLink] = useState('');
  const [orderId, setOrderId] = useState('');

  const handleAnswer = (e: any) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const value = form.get('answer');
    const currentQ = questions[step];

    if (currentQ.type === 'file' && value instanceof File) {
      setFiles(value);
      setAnswers({ ...answers, [currentQ.id]: value.name });
    } else if (typeof value === 'string') {
      setAnswers({ ...answers, [currentQ.id]: value });
    }

    setStep(step + 1);
  };

  const submitData = async () => {
    const formData = new FormData();
    Object.entries(answers).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (files) {
      formData.append('document', files);
    }

    const res = await axios.post('/api/submit', formData);
    setSubmitted(true);
    setOrderId(res.data.orderId);
    setOrderLink(res.data.receiptUrl);
  };

  if (submitted) return (
    <div className="p-4">
      <p className="text-green-600">✅ Order submitted successfully!</p>
      <a
        href={`https://wa.me/917999341660?text=Order%20%23${orderId}%20submitted%20for%20ITR%20filing.%0AHere%20is%20your%20receipt%3A%20${encodeURIComponent(orderLink)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline mt-4 block"
      >
        📤 Share on WhatsApp
      </a>
    </div>
  );

  if (step >= questions.length) {
    return (
      <Card className="max-w-xl m-4 p-4">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Confirm Your Info</h2>
          <ul className="mb-4">
            {questions.map(q => (
              <li key={q.id}><strong>{q.question}</strong>: {answers[q.id]}</li>
            ))}
          </ul>
          <Button onClick={submitData}>Submit Order</Button>
        </CardContent>
      </Card>
    );
  }

  const q = questions[step];
  return (
    <Card className="max-w-xl m-4 p-4">
      <CardContent>
        <form onSubmit={handleAnswer} className="space-y-4">
          <label className="block text-lg font-medium">{q.question}</label>
          {q.type === 'file' ? (
            <Input name="answer" type="file" accept=".pdf,.jpg,.jpeg,.png" required className="w-full" />
          ) : (
            <Input name="answer" required type={q.type} className="w-full" />
          )}
          <Button type="submit">Next</Button>
        </form>
      </CardContent>
    </Card>
  );
}
