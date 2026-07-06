import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { feedbackAPI } from '../services/api';
import { 
  Star, 
  Mic, 
  MicOff, 
  Square, 
  Trash2, 
  Play, 
  MessageSquare, 
  Volume2, 
  CheckCircle, 
  AlertCircle,
  FileText,
  User,
  Calendar
} from 'lucide-react';

export default function Feedback() {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Speech to Text (Dictation) States
  const [isDictating, setIsDictating] = useState(false);
  const [dictationSupported, setDictationSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setDictationSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      
      // Match active language code
      const langMapping = {
        en: 'en-US',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
        gu: 'gu-IN',
        mr: 'mr-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        pa: 'pa-IN'
      };
      rec.lang = langMapping[language] || 'en-US';

      rec.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setComment((prev) => prev + finalTranscript);
        }
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsDictating(false);
      };

      rec.onend = () => {
        setIsDictating(false);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await feedbackAPI.getAllFeedback();
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  // Handle Recording Audio
  const startRecording = async () => {
    try {
      setError('');
      setSuccess('');
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Microphone access denied:', err);
      setError('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const deleteAudio = () => {
    setAudioBlob(null);
    setAudioUrl('');
    setRecordingDuration(0);
  };

  // Toggle speech recognition
  const toggleDictation = () => {
    if (!recognitionRef.current) return;

    if (isDictating) {
      recognitionRef.current.stop();
      setIsDictating(false);
    } else {
      try {
        setError('');
        recognitionRef.current.start();
        setIsDictating(true);
      } catch (err) {
        console.error('Speech recognition start failed:', err);
        setError('Dictation failed to start. Please try again.');
      }
    }
  };

  // Submit Feedback Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    if (!comment.trim() && !audioBlob) {
      setError('Please provide feedback comment text or record a voice note.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('comment', comment);
      
      if (audioBlob) {
        formData.append('voice', audioBlob, 'feedback-recording.webm');
      }

      const res = await feedbackAPI.submitFeedback(formData);

      if (res.data.success) {
        setSuccess(t('feedbackSuccess'));
        setRating(0);
        setComment('');
        deleteAudio();
        // Refresh list
        fetchFeedbacks();
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError(err.response?.data?.error || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-white bg-clip-text bg-gradient-to-r from-white to-emerald-400">
          {t('feedbackHeader')}
        </h1>
        <p className="text-slate-400 text-sm mt-1">{t('feedbackSub')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Feedback Submission Form (Grid Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800/60 pb-3">
              <MessageSquare className="text-farm-green" size={18} />
              Share Your Thoughts
            </h2>

            {/* Notification Badges */}
            {error && (
              <div className="bg-red-950/40 border border-red-900/30 text-red-400 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-emerald-950/40 border border-emerald-900/30 text-farm-mint p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Star Rating */}
            <div className="flex flex-col gap-2">
              <label className="form-label font-medium">{t('feedbackRating')}</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRating(index)}
                    onMouseEnter={() => setHoverRating(index)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-600 transition-all transform hover:scale-125 focus:outline-none"
                  >
                    <Star 
                      size={28} 
                      className={`transition-colors duration-150 ${
                        index <= (hoverRating || rating)
                          ? 'fill-farm-gold text-farm-gold filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]'
                          : 'text-slate-600 hover:text-slate-500'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-xs font-semibold text-farm-mint font-mono ml-2 px-2.5 py-0.5 bg-farm-green/10 rounded-full border border-farm-green/20">
                    {rating} / 5
                  </span>
                )}
              </div>
            </div>

            {/* Text Comments */}
            <div className="flex flex-col gap-1.5 relative">
              <div className="flex justify-between items-center">
                <label htmlFor="feedback-comment" className="form-label">{t('feedbackComment')}</label>
                
                {/* Speech Dictation Button */}
                {dictationSupported && (
                  <button
                    type="button"
                    onClick={toggleDictation}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      isDictating
                        ? 'bg-red-950/40 text-red-400 border-red-900/40 animate-pulse'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-700/60'
                    }`}
                  >
                    <Volume2 size={12} />
                    <span>{isDictating ? t('feedbackDictating').split(' ')[0] : t('feedbackDictate')}</span>
                  </button>
                )}
              </div>

              <textarea
                id="feedback-comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How has your experience been recommending crops or detecting diseases?"
                className="form-input text-sm resize-none"
              />
              
              {isDictating && (
                <div className="absolute bottom-2 left-2 text-[10px] text-red-400 flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded border border-red-950">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  {t('feedbackDictating')}
                </div>
              )}
            </div>

            {/* Voice Feedback Recorder */}
            <div className="flex flex-col gap-2.5 bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
              <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                {t('feedbackVoice')}
              </label>
              
              <div className="flex items-center gap-3.5">
                {/* Record Button */}
                {!audioUrl ? (
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : 'bg-farm-green hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {isRecording ? <Square size={18} /> : <Mic size={20} />}
                  </button>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                    <Play size={18} />
                  </div>
                )}

                <div className="flex-grow flex flex-col justify-center">
                  {isRecording ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-red-400 font-medium flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                        {t('feedbackRecording')}
                      </span>
                      <span className="text-lg font-mono font-bold text-slate-100 mt-0.5">
                        {formatDuration(recordingDuration)}
                      </span>
                    </div>
                  ) : audioUrl ? (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Voice note recorded</span>
                      <audio src={audioUrl} controls className="h-8 max-w-full rounded-md opacity-90" />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">{t('feedbackRecord')}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Speak up to 1 minute about your experience</span>
                    </div>
                  )}
                </div>

                {audioUrl && (
                  <button
                    type="button"
                    onClick={deleteAudio}
                    className="p-2.5 rounded-xl border border-red-900/30 bg-red-950/20 hover:bg-red-950/40 text-red-400 transition-all active:scale-90"
                    title={t('feedbackDeleteVoice')}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-sm mt-2 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : t('feedbackSubmit')}
            </button>
          </form>

        </div>

        {/* Right Side: Feedback History / Reviews Board (Grid Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <CheckCircle className="text-farm-mint" size={18} />
            {t('feedbackRecent')}
          </h2>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-farm-green border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 text-sm">{t('loading')}</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800/80 text-slate-500 text-sm">
              No feedback left yet. Be the first farmer to share your experience!
            </div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[700px] pr-2">
              {feedbacks.map((fb) => (
                <div 
                  key={fb._id} 
                  className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-800/100 flex flex-col gap-3.5 transition-all duration-200"
                >
                  {/* Author Card Info */}
                  <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-farm-green/15 text-farm-green flex items-center justify-center font-bold text-sm border border-farm-green/20">
                        {fb.username ? fb.username.charAt(0).toUpperCase() : 'F'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                          {fb.username || 'Anonymous Farmer'}
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-normal uppercase">Farmer</span>
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar size={10} />
                          {new Date(fb.createdAt).toLocaleDateString()} at {new Date(fb.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* rating display */}
                    <div className="flex items-center gap-0.5 bg-slate-950/40 px-2.5 py-1 rounded-xl border border-slate-800">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <Star 
                          key={starIdx} 
                          size={13} 
                          className={`transition-colors ${
                            starIdx <= fb.rating
                              ? 'fill-farm-gold text-farm-gold'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment Text */}
                  {fb.comment && (
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap pl-1">
                      "{fb.comment}"
                    </p>
                  )}

                  {/* Voice recording display */}
                  {fb.voiceUrl && (
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex flex-col gap-1.5">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                        <Volume2 size={12} className="text-farm-green" />
                        {t('feedbackListen')}
                      </span>
                      <audio 
                        src={fb.voiceUrl} 
                        controls 
                        preload="none"
                        className="w-full h-8 opacity-90"
                      />
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
