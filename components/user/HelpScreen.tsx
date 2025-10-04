import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 text-left font-semibold text-gray-800"
            >
                <span>{title}</span>
                <ChevronDown
                    size={20}
                    className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                }`}
            >
                <div className="pt-2 pb-4 text-gray-600 space-y-2">{children}</div>
            </div>
        </div>
    );
};

const faqs = [
    {
        question: "How do I invest in a plan?",
        answer: (
            <>
                <p>1. Navigate to the 'Invest' tab from the bottom navigation bar.</p>
                <p>2. Browse the available investment plans, which are grouped by category.</p>
                <p>3. Select a plan you are interested in and tap the 'Invest Now' button.</p>
                <p>4. In the modal that appears, you can review the plan details and select the quantity you wish to purchase.</p>
                <p>5. Tap 'Invest Now' at the bottom of the modal to confirm. The investment amount will be deducted from your available balance.</p>
            </>
        ),
    },
    {
        question: "How do I deposit money into my account?",
        answer: (
            <>
                <p>1. From the 'Home' or 'Profile' screen, tap the 'Deposit' or 'Recharge' button.</p>
                <p>2. Enter the amount you wish to deposit (minimum ₹200).</p>
                <p>3. Select a payment channel from the available options.</p>
                <p>4. Tap 'To Deposit' and you will be redirected to a secure payment page to complete the transaction.</p>
                <p>5. Once the payment is successful, the amount will be reflected in your account balance shortly.</p>
            </>
        ),
    },
    {
        question: "How do I withdraw my earnings?",
        answer: (
            <>
                <p>1. Before withdrawing, ensure you have added your bank account details. You can do this from 'Profile' &gt; 'My Card'.</p>
                <p>2. From the 'Home' or 'Profile' screen, tap the 'Withdraw' button.</p>
                <p>3. Enter the amount you wish to withdraw (minimum ₹300). A tax of 8% will be applied.</p>
                <p>4. Your linked bank account will be pre-selected. Tap 'Confirm' to submit your withdrawal request.</p>
                <p>5. Withdrawals are typically processed within 24 hours on business days.</p>
            </>
        ),
    },
    {
        question: "How do I change my login or fund password?",
        answer: (
             <>
                <p>1. Go to the 'Profile' tab.</p>
                <p>2. Under the 'Security' section, you will find options for 'Login Password' and 'Fund Password'.</p>
                <p>3. Select the password you wish to change and follow the on-screen instructions, which typically involve entering your old password, a new password, and sometimes an OTP for verification.</p>
            </>
        )
    },
    {
        question: "What is the Lucky Draw?",
        answer: (
            <>
                <p>The Lucky Draw is a fun feature where you can use your chances to win various prizes, including cash bonuses, physical items, or nothing.</p>
                <p>You can earn lucky draw chances by completing tasks or participating in platform events. Each spin consumes one chance.</p>
            </>
        )
    }
];

const HelpScreen: React.FC = () => {
    const { setCurrentView } = useApp();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10 shrink-0">
                <button onClick={() => setCurrentView('profile')} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">Help Center</h1>
            </header>

            <main className="flex-1 p-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-green-100 p-3 rounded-full">
                            <BookOpen className="text-green-600" size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Frequently Asked Questions</h2>
                            <p className="text-sm text-gray-500">Find answers to common questions below.</p>
                        </div>
                    </div>
                    
                    <div className="divide-y">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} title={faq.question}>
                                {faq.answer}
                            </AccordionItem>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HelpScreen;
