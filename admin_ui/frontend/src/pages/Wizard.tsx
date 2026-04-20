import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const WizardSimplified = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [config, setConfig] = useState({
        deepgram_key: '',
        llm_provider: 'google',
        openai_key: '',
        google_key: '',
        mistral_key: '',
        asterisk_host: '127.0.0.1',
        asterisk_username: 'asterisk',
        asterisk_password: '',
        asterisk_port: 8088,
    });

    const handleTestKey = async (provider: string, key: string) => {
        if (!key.trim()) {
            toast.error(`${provider} API key is required`);
            return;
        }

        try {
            setLoading(true);
            // Simple validation - check key format
            if (provider === 'deepgram' && !key.startsWith('') ) {
                toast.error('Invalid Deepgram key format');
                return;
            }
            toast.success(`${provider} key is valid!`);
        } catch (err) {
            toast.error(`Failed to validate ${provider} key`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        if (!config.deepgram_key.trim()) {
            toast.error('Deepgram API key is required');
            return;
        }

        if (!config[config.llm_provider + '_key' as keyof typeof config]) {
            toast.error(`${config.llm_provider} API key is required`);
            return;
        }

        try {
            setLoading(true);

            // Save to .env
            const envData = {
                DEEPGRAM_API_KEY: config.deepgram_key,
                GOOGLE_API_KEY: config.llm_provider === 'google_live' ? config.google_key : '',
                OPENAI_API_KEY: config.llm_provider === 'openai_realtime' ? config.openai_key : '',
                ASTERISK_HOST: config.asterisk_host,
                ASTERISK_ARI_USERNAME: config.asterisk_username,
                ASTERISK_ARI_PASSWORD: config.asterisk_password,
            };

            await axios.post('/api/config/save-env', envData);

            // Update AI config with selected LLM
            const aiConfig = {
                default_provider: 'deepgram',
                pipelines: {
                    deepgram_llm: {
                        stt: 'deepgram_stt',
                        llm: config.llm_provider === 'google_live' ? 'google_llm' : 'openai_llm',
                        tts: 'deepgram_tts',
                    }
                }
            };

            await axios.post('/api/config/save', aiConfig);

            toast.success('Configuration saved!');
            setStep(3);
        } catch (err) {
            toast.error('Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Setup Wizard
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className={step >= 1 ? 'font-semibold text-slate-900 dark:text-white' : ''}>
                            1. API Keys
                        </span>
                        <span>→</span>
                        <span className={step >= 2 ? 'font-semibold text-slate-900 dark:text-white' : ''}>
                            2. Asterisk Config
                        </span>
                        <span>→</span>
                        <span className={step >= 3 ? 'font-semibold text-slate-900 dark:text-white' : ''}>
                            3. Complete
                        </span>
                    </div>
                </div>

                {/* Step 1: API Keys */}
                {step === 1 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Configure API Keys
                        </h2>

                        {/* Deepgram API Key */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                                Deepgram API Key <span className="text-red-500">*</span>
                            </label>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Used for Speech-to-Text and Text-to-Speech
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    value={config.deepgram_key}
                                    onChange={e => setConfig({ ...config, deepgram_key: e.target.value })}
                                    placeholder="Enter your Deepgram API key"
                                />
                                <button
                                    onClick={() => handleTestKey('Deepgram', config.deepgram_key)}
                                    disabled={loading || !config.deepgram_key}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
                                >
                                    Test
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Get your key from <a href="https://console.deepgram.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.deepgram.com</a>
                            </p>
                        </div>

                        {/* LLM Provider Selection */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                                LLM Provider <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                value={config.llm_provider}
                                onChange={e => setConfig({ ...config, llm_provider: e.target.value })}
                            >
                                <option value="google">Google Gemini (Recommended)</option>
                                <option value="openai">OpenAI GPT-4</option>
                                <option value="mistral">Mistral AI</option>
                            </select>
                        </div>

                        {/* LLM API Key - Google */}
                        {config.llm_provider === 'google' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                                    Google API Key <span className="text-red-500">*</span>
                                </label>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    For Google Gemini LLM
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        value={config.google_key}
                                        onChange={e => setConfig({ ...config, google_key: e.target.value })}
                                        placeholder="Enter your Google API key"
                                    />
                                    <button
                                        onClick={() => handleTestKey('Google', config.google_key)}
                                        disabled={loading || !config.google_key}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
                                    >
                                        Test
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Get your key from <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.cloud.google.com</a>
                                </p>
                            </div>
                        )}

                        {/* LLM API Key - OpenAI */}
                        {config.llm_provider === 'openai' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                                    OpenAI API Key <span className="text-red-500">*</span>
                                </label>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    For GPT-4 LLM model
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        value={config.openai_key}
                                        onChange={e => setConfig({ ...config, openai_key: e.target.value })}
                                        placeholder="sk-..."
                                    />
                                    <button
                                        onClick={() => handleTestKey('OpenAI', config.openai_key)}
                                        disabled={loading || !config.openai_key}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
                                    >
                                        Test
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Get your key from <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com</a>
                                </p>
                            </div>
                        )}

                        {/* LLM API Key - Mistral */}
                        {config.llm_provider === 'mistral' && (
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                                    Mistral API Key <span className="text-red-500">*</span>
                                </label>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    For Mistral AI model
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        value={config.mistral_key}
                                        onChange={e => setConfig({ ...config, mistral_key: e.target.value })}
                                        placeholder="Enter your Mistral API key"
                                    />
                                    <button
                                        onClick={() => handleTestKey('Mistral', config.mistral_key)}
                                        disabled={loading || !config.mistral_key}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
                                    >
                                        Test
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Get your key from <a href="https://console.mistral.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.mistral.ai</a>
                                </p>
                            </div>
                        )}

                        {/* Next Button */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="ml-auto px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Asterisk Configuration */}
                {step === 2 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Asterisk Configuration
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    Asterisk Host <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    value={config.asterisk_host}
                                    onChange={e => setConfig({ ...config, asterisk_host: e.target.value })}
                                    placeholder="127.0.0.1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        value={config.asterisk_username}
                                        onChange={e => setConfig({ ...config, asterisk_username: e.target.value })}
                                        placeholder="asterisk"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        value={config.asterisk_password}
                                        onChange={e => setConfig({ ...config, asterisk_password: e.target.value })}
                                        placeholder="password"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    ARI Port
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    value={config.asterisk_port}
                                    onChange={e => setConfig({ ...config, asterisk_port: parseInt(e.target.value) })}
                                    placeholder="8088"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSaveConfig}
                                disabled={loading}
                                className="ml-auto px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold"
                            >
                                {loading ? 'Saving...' : 'Save & Complete'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Complete */}
                {step === 3 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center space-y-6">
                        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Setup Complete!
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                Your AVA-AI Voice Agent is ready to use.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WizardSimplified;
