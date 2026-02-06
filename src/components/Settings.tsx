import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Play, Square, Save, CheckCircle } from 'lucide-react';
import { getUserSettings, saveUserSettings, saveCustomAudio } from '../lib/supabase';

interface SettingsProps {
  onBack: () => void;
  onAudioChange: (url: string, enabled: boolean) => void;
  onTypewriterChange: (enabled: boolean) => void;
  onCustomTypewriterChange: (url: string, enabled: boolean) => void;
  onParagraphSoundChange: (url: string, enabled: boolean) => void;
  onTargetWpmSoundChange: (url: string, enabled: boolean) => void;
}

export default function Settings({ onBack, onAudioChange, onTypewriterChange, onCustomTypewriterChange, onParagraphSoundChange, onTargetWpmSoundChange }: SettingsProps) {
  const [defaultWordGoal, setDefaultWordGoal] = useState(500);
  const [defaultTimeGoal, setDefaultTimeGoal] = useState(30);
  const [defaultMinWPM, setDefaultMinWPM] = useState(30);
  const [defaultNoBackspace, setDefaultNoBackspace] = useState(false);
  const [targetWpm, setTargetWpm] = useState(60);
  const [fullscreenEnabled, setFullscreenEnabled] = useState(true);
  const [useCustomAudio, setUseCustomAudio] = useState(false);
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [typewriterSoundEnabled, setTypewriterSoundEnabled] = useState(true);
  const [useCustomTypewriter, setUseCustomTypewriter] = useState(false);
  const [customTypewriterUrl, setCustomTypewriterUrl] = useState('');
  const [customTypewriterName, setCustomTypewriterName] = useState('');
  const [useCustomParagraphSound, setUseCustomParagraphSound] = useState(false);
  const [customParagraphSoundUrl, setCustomParagraphSoundUrl] = useState('');
  const [customParagraphSoundName, setCustomParagraphSoundName] = useState('');
  const [testParagraphPlaying, setTestParagraphPlaying] = useState(false);
  const [useCustomTargetWpmSound, setUseCustomTargetWpmSound] = useState(false);
  const [customTargetWpmSoundUrl, setCustomTargetWpmSoundUrl] = useState('');
  const [customTargetWpmSoundName, setCustomTargetWpmSoundName] = useState('');
  const [testTargetWpmPlaying, setTestTargetWpmPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testPlaying, setTestPlaying] = useState(false);
  const [testTypewriterPlaying, setTestTypewriterPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typewriterAudioRef = useRef<HTMLAudioElement | null>(null);
  const paragraphAudioRef = useRef<HTMLAudioElement | null>(null);
  const targetWpmAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typewriterFileInputRef = useRef<HTMLInputElement>(null);
  const paragraphFileInputRef = useRef<HTMLInputElement>(null);
  const targetWpmFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const settings = await getUserSettings();
      if (settings) {
        setDefaultWordGoal(settings.default_word_goal);
        setDefaultTimeGoal(Math.floor(settings.default_time_goal_seconds / 60));
        setDefaultMinWPM(settings.default_minimum_wpm);
        setDefaultNoBackspace(settings.no_backspace_mode);
        setUseCustomAudio(settings.use_custom_audio);
        setCustomAudioUrl(settings.custom_audio_url);
        setTypewriterSoundEnabled(settings.typewriter_sound_enabled ?? true);
        setUseCustomTypewriter(settings.use_custom_typewriter ?? false);
        setCustomTypewriterUrl(settings.custom_typewriter_url ?? '');
        if (settings.custom_typewriter_url) {
          setCustomTypewriterName('Custom sound uploaded');
        }
        setUseCustomParagraphSound(settings.use_custom_paragraph_sound ?? false);
        setCustomParagraphSoundUrl(settings.custom_paragraph_sound_url ?? '');
        if (settings.custom_paragraph_sound_url) {
          setCustomParagraphSoundName('Custom sound uploaded');
        }
        setTargetWpm(settings.target_wpm ?? 60);
        setFullscreenEnabled(settings.fullscreen_enabled ?? true);
        setUseCustomTargetWpmSound(settings.use_custom_target_wpm_sound ?? false);
        setCustomTargetWpmSoundUrl(settings.custom_target_wpm_sound_url ?? '');
        if (settings.custom_target_wpm_sound_url) {
          setCustomTargetWpmSoundName('Custom sound uploaded');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveUserSettings({
        default_word_goal: defaultWordGoal,
        default_time_goal_seconds: defaultTimeGoal * 60,
        default_minimum_wpm: defaultMinWPM,
        no_backspace_mode: defaultNoBackspace,
        target_wpm: targetWpm,
        fullscreen_enabled: fullscreenEnabled,
        use_custom_audio: useCustomAudio,
        custom_audio_url: customAudioUrl,
        typewriter_sound_enabled: typewriterSoundEnabled,
        use_custom_typewriter: useCustomTypewriter,
        custom_typewriter_url: customTypewriterUrl,
        use_custom_paragraph_sound: useCustomParagraphSound,
        custom_paragraph_sound_url: customParagraphSoundUrl,
        use_custom_target_wpm_sound: useCustomTargetWpmSound,
        custom_target_wpm_sound_url: customTargetWpmSoundUrl,
      });
      onAudioChange(customAudioUrl, useCustomAudio);
      onTypewriterChange(typewriterSoundEnabled);
      onCustomTypewriterChange(customTypewriterUrl, useCustomTypewriter);
      onParagraphSoundChange(customParagraphSoundUrl, useCustomParagraphSound);
      onTargetWpmSoundChange(customTargetWpmSoundUrl, useCustomTargetWpmSound);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;

        const audioFile = {
          file_name: file.name,
          file_url: base64,
          file_size: file.size,
          mime_type: file.type,
        };

        await saveCustomAudio(audioFile);
        setCustomAudioUrl(base64);
        setUseCustomAudio(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload audio file');
    }
  }

  function handleTypewriterFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomTypewriterUrl(base64);
      setCustomTypewriterName(file.name);
      setUseCustomTypewriter(true);
    };
    reader.readAsDataURL(file);
  }

  function handleTestTypewriterAudio() {
    if (testTypewriterPlaying) {
      if (typewriterAudioRef.current) {
        typewriterAudioRef.current.pause();
        typewriterAudioRef.current.currentTime = 0;
      }
      setTestTypewriterPlaying(false);
    } else {
      if (!customTypewriterUrl) {
        alert('Please upload an audio file first');
        return;
      }
      typewriterAudioRef.current = new Audio(customTypewriterUrl);
      typewriterAudioRef.current.play();
      typewriterAudioRef.current.addEventListener('ended', () => setTestTypewriterPlaying(false));
      setTestTypewriterPlaying(true);
    }
  }

  function handleParagraphFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomParagraphSoundUrl(base64);
      setCustomParagraphSoundName(file.name);
      setUseCustomParagraphSound(true);
    };
    reader.readAsDataURL(file);
  }

  function handleTestParagraphAudio() {
    if (testParagraphPlaying) {
      if (paragraphAudioRef.current) {
        paragraphAudioRef.current.pause();
        paragraphAudioRef.current.currentTime = 0;
      }
      setTestParagraphPlaying(false);
    } else {
      if (!customParagraphSoundUrl) {
        alert('Please upload an audio file first');
        return;
      }
      paragraphAudioRef.current = new Audio(customParagraphSoundUrl);
      paragraphAudioRef.current.play();
      paragraphAudioRef.current.addEventListener('ended', () => setTestParagraphPlaying(false));
      setTestParagraphPlaying(true);
    }
  }

  function handleTargetWpmFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomTargetWpmSoundUrl(base64);
      setCustomTargetWpmSoundName(file.name);
      setUseCustomTargetWpmSound(true);
    };
    reader.readAsDataURL(file);
  }

  function handleTestTargetWpmAudio() {
    if (testTargetWpmPlaying) {
      if (targetWpmAudioRef.current) {
        targetWpmAudioRef.current.pause();
        targetWpmAudioRef.current.currentTime = 0;
      }
      setTestTargetWpmPlaying(false);
    } else {
      if (!customTargetWpmSoundUrl) {
        alert('Please upload an audio file first');
        return;
      }
      targetWpmAudioRef.current = new Audio(customTargetWpmSoundUrl);
      targetWpmAudioRef.current.play();
      targetWpmAudioRef.current.addEventListener('ended', () => setTestTargetWpmPlaying(false));
      setTestTargetWpmPlaying(true);
    }
  }

  function handleTestAudio() {
    if (testPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setTestPlaying(false);
    } else {
      if (!customAudioUrl) {
        alert('Please upload an audio file first');
        return;
      }
      audioRef.current = new Audio(customAudioUrl);
      audioRef.current.play();
      audioRef.current.addEventListener('ended', () => setTestPlaying(false));
      setTestPlaying(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-gray-400 text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>

          <h1 className="text-4xl font-bold text-gray-100 mb-2">Settings</h1>
          <p className="text-gray-400">Configure your writing preferences</p>
        </div>

        <div className="space-y-6">
          <div className="bg-dark-light border border-dark-lighter rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Session Defaults</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Default Word Goal
                </label>
                <input
                  type="number"
                  value={defaultWordGoal}
                  onChange={(e) => setDefaultWordGoal(parseInt(e.target.value) || 0)}
                  className="w-full bg-dark border border-dark-lighter rounded px-4 py-3 text-gray-100 focus:outline-none focus:border-gray-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Default Time Goal (minutes)
                </label>
                <input
                  type="number"
                  value={defaultTimeGoal}
                  onChange={(e) => setDefaultTimeGoal(parseInt(e.target.value) || 0)}
                  className="w-full bg-dark border border-dark-lighter rounded px-4 py-3 text-gray-100 focus:outline-none focus:border-gray-500"
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="bg-dark-light border border-dark-lighter rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Writing Mode</h2>
            <p className="text-gray-500 text-sm mb-4">These settings apply to every session</p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Minimum WPM
                </label>
                <input
                  type="number"
                  value={defaultMinWPM}
                  onChange={(e) => setDefaultMinWPM(parseInt(e.target.value) || 0)}
                  className="w-full bg-dark border border-dark-lighter rounded px-4 py-3 text-gray-100 focus:outline-none focus:border-gray-500"
                  min="1"
                />
                <p className="text-gray-500 text-sm mt-1">Fall below this and face the consequences</p>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Target WPM
                </label>
                <input
                  type="number"
                  value={targetWpm}
                  onChange={(e) => setTargetWpm(parseInt(e.target.value) || 0)}
                  className="w-full bg-dark border border-dark-lighter rounded px-4 py-3 text-gray-100 focus:outline-none focus:border-gray-500"
                  min="1"
                />
                <p className="text-gray-500 text-sm mt-1">Plays a sound when you reach this pace</p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="defaultNoBackspace"
                  checked={defaultNoBackspace}
                  onChange={(e) => setDefaultNoBackspace(e.target.checked)}
                  className="w-5 h-5 bg-dark border border-dark-lighter rounded cursor-pointer"
                />
                <label htmlFor="defaultNoBackspace" className="text-gray-300 cursor-pointer select-none">
                  No Backspace Mode (disable editing)
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="fullscreenEnabled"
                  checked={fullscreenEnabled}
                  onChange={(e) => setFullscreenEnabled(e.target.checked)}
                  className="w-5 h-5 bg-dark border border-dark-lighter rounded cursor-pointer"
                />
                <label htmlFor="fullscreenEnabled" className="text-gray-300 cursor-pointer select-none">
                  Enter fullscreen during sessions
                </label>
              </div>
            </div>
          </div>

          <div className="bg-dark-light border border-dark-lighter rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Alert Sound</h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="useCustomAudio"
                  checked={useCustomAudio}
                  onChange={(e) => setUseCustomAudio(e.target.checked)}
                  className="w-5 h-5 bg-dark border border-dark-lighter rounded cursor-pointer"
                />
                <label htmlFor="useCustomAudio" className="text-gray-300 cursor-pointer select-none">
                  Use custom audio file (otherwise browser beep)
                </label>
              </div>

              {useCustomAudio && (
                <>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-dark border border-dark-lighter hover:border-gray-500 text-gray-300 py-3 rounded transition-colors flex items-center justify-center space-x-2"
                    >
                      <Upload size={18} />
                      <span>Upload Audio File (max 5MB)</span>
                    </button>
                    {customAudioUrl && (
                      <p className="text-gray-400 text-sm mt-2">Audio file uploaded</p>
                    )}
                  </div>

                  {customAudioUrl && (
                    <button
                      onClick={handleTestAudio}
                      className="w-full bg-dark border border-dark-lighter hover:border-gray-500 text-gray-300 py-3 rounded transition-colors flex items-center justify-center space-x-2"
                    >
                      {testPlaying ? (
                        <>
                          <Square size={18} />
                          <span>Stop Test</span>
                        </>
                      ) : (
                        <>
                          <Play size={18} />
                          <span>Test Audio</span>
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-dark-light border border-dark-lighter rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Typewriter Sound</h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="typewriterSound"
                  checked={typewriterSoundEnabled}
                  onChange={(e) => setTypewriterSoundEnabled(e.target.checked)}
                  className="w-5 h-5 bg-dark border border-dark-lighter rounded cursor-pointer"
                />
                <label htmlFor="typewriterSound" className="text-gray-300 cursor-pointer select-none">
                  Enable typewriter clacking sound on keypress
                </label>
              </div>

              {typewriterSoundEnabled && (
                <>
                  <div className="border-t border-dark-lighter pt-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        id="useCustomTypewriter"
                        checked={useCustomTypewriter}
                        onChange={(e) => setUseCustomTypewriter(e.target.checked)}
                        className="w-5 h-5 bg-dark border border-dark-lighter rounded cursor-pointer"
                      />
                      <label htmlFor="useCustomTypewriter" className="text-gray-300 cursor-pointer select-none">
                        Use custom sound file (otherwise built-in click)
                      </label>
                    </div>

                    {useCustomTypewriter && (
                      <div className="space-y-3 pl-8">
                        <input
                          ref={typewriterFileInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleTypewriterFileUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => typewriterFileInputRef.current?.click()}
                          className="w-full bg-dark border border-dark-lighter hover:border-gray-500 text-gray-300 py-3 rounded transition-colors flex items-center justify-center space-x-2"
                        >
                          <Upload size={18} />
                          <span>Upload Typewriter Sound (max 5MB)</span>
                        </button>
                        {customTypewriterUrl && (
                          <>
                            <p className="text-gray-400 text-sm">{customTypewriterName}</p>
                            <button
                              onClick={handleTestTypewriterAudio}
                              className="w-full bg-dark border border-dark-lighter hover:border-gray-500 text-gray-300 py-3 rounded transition-colors flex items-center justify-center space-x-2"
                            >
                              {testTypewriterPlaying ? (
                                <>
                                  <Square size={18} />
                                  <span>Stop Test</span>
                                </>
                              ) : (
                                <>
                                  <Play size={18} />
                                  <span>Test Sound</span>
                                </>
                              )}
                            </button>
                          </>
                        )}
                        <p className="text-gray-500 text-xs">
                          Upload a short click or clack sound. It will play once per keystroke.
                        </p>
                      </div>
                    )}
                  </div>

                  {!useCustomTypewriter && (
                    <p className="text-gray-400 text-sm">
                      Using built-in mechanical click sound
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-dark-light border border-dark-lighter rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Paragraph Sound</h2>
            <p className="text-gray-500 text-sm mb-4">Plays when you start a new paragraph (double Enter)</p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="useCustomParagraphSound"
                  checked={useCustomParagraphSound}
                  onChange={(e) => setUseCustomParagraphSound(e.target.checked)}
                  className="w-5 h-5 bg-dark border border-dark-lighter rounded cursor-pointer"
                />
                <label htmlFor="useCustomParagraphSound" className="text-gray-300 cursor-pointer select-none">
                  Enable custom paragraph sound
                </label>
              </div>

              {useCustomParagraphSound && (
                <div className="space-y-3 pl-8">
                  <input
                    ref={paragraphFileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleParagraphFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => paragraphFileInputRef.current?.click()}
                    className="w-full bg-dark border border-dark-lighter hover:border-gray-500 text-gray-300 py-3 rounded transition-colors flex items-center justify-center space-x-2"
                  >
                    <Upload size={18} />
                    <span>Upload Paragraph Sound (max 5MB)</span>
                  </button>
                  {customParagraphSoundUrl && (
                    <>
                      <p className="text-gray-400 text-sm">{customParagraphSoundName}</p>
                      <button
                        onClick={handleTestParagraphAudio}
                        className="w-full bg-dark border border-dark-lighter hover:border-gray-500 text-gray-300 py-3 rounded transition-colors flex items-center justify-center space-x-2"
                      >
                        {testParagraphPlaying ? (
                          <>
                            <Square size={18} />
                            <span>Stop Test</span>
                          </>
                        ) : (
                          <>
                            <Play size={18} />
                            <span>Test Sound</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                  <p className="text-gray-500 text-xs">
                    Upload a sound that plays each time you begin a new paragraph.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-dark-light border border-dark-lighter rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Target WPM Sound</h2>
            <p className="text-gray-500 text-sm mb-4">Plays when you reach your target writing pace</p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="useCustomTargetWpmSound"
                  checked={useCustomTargetWpmSound}
                  onChange={(e) => setUseCustomTargetWpmSound(e.target.checked)}
                  className="w-5 h-5 bg-dark border border-dark-lighter rounded cursor-pointer"
                />
                <label htmlFor="useCustomTargetWpmSound" className="text-gray-300 cursor-pointer select-none">
                  Enable target WPM achievement sound
                </label>
              </div>

              {useCustomTargetWpmSound && (
                <div className="space-y-3 pl-8">
                  <input
                    ref={targetWpmFileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleTargetWpmFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => targetWpmFileInputRef.current?.click()}
                    className="w-full bg-dark border border-dark-lighter hover:border-gray-500 text-gray-300 py-3 rounded transition-colors flex items-center justify-center space-x-2"
                  >
                    <Upload size={18} />
                    <span>Upload Target WPM Sound (max 5MB)</span>
                  </button>
                  {customTargetWpmSoundUrl && (
                    <>
                      <p className="text-gray-400 text-sm">{customTargetWpmSoundName}</p>
                      <button
                        onClick={handleTestTargetWpmAudio}
                        className="w-full bg-dark border border-dark-lighter hover:border-gray-500 text-gray-300 py-3 rounded transition-colors flex items-center justify-center space-x-2"
                      >
                        {testTargetWpmPlaying ? (
                          <>
                            <Square size={18} />
                            <span>Stop Test</span>
                          </>
                        ) : (
                          <>
                            <Play size={18} />
                            <span>Test Sound</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                  <p className="text-gray-500 text-xs">
                    Upload a celebratory sound that plays when you hit your target WPM.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gray-100 hover:bg-white text-dark font-semibold py-4 rounded transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {saved ? (
              <>
                <CheckCircle size={20} />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
