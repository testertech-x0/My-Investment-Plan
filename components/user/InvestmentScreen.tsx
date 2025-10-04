import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { InvestmentPlan } from '../../types';
import BottomNav from './BottomNav';

const InvestmentScreen: React.FC = () => {
  const { currentUser, investmentPlans, investInPlan, loginAsUser, returnToAdmin, appName } = useApp();
  
  const availableCategories = useMemo(() => 
    [...new Set(investmentPlans.map(p => p.category))].sort(), 
    [investmentPlans]
  );
  
  const [selectedTab, setSelectedTab] = useState(availableCategories[0] || '');
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!currentUser) return null;

  const filteredPlans = investmentPlans.filter(plan => plan.category === selectedTab);

  const getUserInvestment = (planId: string) => {
    return currentUser.investments.find(inv => inv.planId === planId);
  };

  const handleInvest = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setQuantity(1);
    setShowModal(true);
  };

  const confirmInvestment = () => {
    if (!selectedPlan) return;
    const result = investInPlan(selectedPlan.id, quantity);
    if (result.success) {
      setShowModal(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {loginAsUser && (
        <div className="bg-yellow-400 text-black px-4 py-2 text-center text-sm font-semibold sticky top-0 z-20">
          Admin Mode: Viewing as {currentUser.id}
          <button onClick={returnToAdmin} className="ml-4 underline">Return to Admin</button>
        </div>
      )}

      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 sticky top-0 z-0">
        <h1 className="text-2xl font-bold mb-2">Investment Plans</h1>
        <p className="text-3xl font-bold">₹{currentUser.balance.toFixed(2)}</p>
        <p className="text-sm opacity-90">Available Balance</p>
      </div>

      <div className="px-6 py-4">
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl shadow sticky top-0 z-10 overflow-x-auto">
          {availableCategories.length > 0 ? availableCategories.map(tab => (
            <button key={tab} onClick={() => setSelectedTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition whitespace-nowrap ${selectedTab === tab ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
              {tab}
            </button>
          )) : <p className="text-center text-gray-500 py-2 w-full">No categories available.</p>}
        </div>

        <div className="space-y-4">
          {filteredPlans.length > 0 ? filteredPlans.map(plan => {
            const userInv = getUserInvestment(plan.id);
            return (
              <div key={plan.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.category}</p>
                  </div>
                  {userInv && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Qty: {userInv.quantity}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-center border-t border-b py-4">
                  <div>
                    <p className="text-xs text-gray-500">Investment</p>
                    <p className="text-lg font-bold text-gray-800">₹{userInv?.investedAmount || plan.minInvestment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                    <p className="text-lg font-bold text-green-600">₹{userInv?.totalRevenue || (plan.dailyReturn * plan.duration)}</p>

                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Daily Earnings</p>
                    <p className="text-lg font-bold text-blue-600">₹{userInv?.dailyEarnings || plan.dailyReturn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue Days</p>
                    <p className="text-lg font-bold text-purple-600">{plan.duration} Days</p>
                  </div>
                </div>

                <button onClick={() => handleInvest(plan)}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition">
                  Invest Now
                </button>
              </div>
            );
          }) : (
            <div className="text-center text-gray-500 py-16">
                <p>No investment plans available in this category.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col justify-end z-50" onClick={() => setShowModal(false)}>
              <div className="bg-white rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
                  <header className="p-4 border-b flex justify-between items-center shrink-0">
                      <h2 className="text-lg font-bold text-gray-800">{selectedPlan.name}</h2>
                      <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                          <X size={24} />
                      </button>
                  </header>
                  
                  <div className="p-6 overflow-y-auto">
                      <div className="mb-6">
                          <h3 className="text-sm font-semibold text-gray-500 mb-2">Details of financial projects</h3>
                          <div className="space-y-3 text-sm">
                              <div className="flex justify-between"><span className="text-gray-600">Total Income</span><span className="font-semibold text-gray-800">₹{(selectedPlan.dailyReturn * selectedPlan.duration * quantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                              <div className="flex justify-between"><span className="text-gray-600">Daily Income</span><span className="font-semibold text-gray-800">₹{(selectedPlan.dailyReturn * quantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                              <div className="flex justify-between"><span className="text-gray-600">Revenue Days</span><span className="font-semibold text-gray-800">{selectedPlan.duration} Days</span></div>
                          </div>
                      </div>

                      <div className="mb-6">
                          <h3 className="text-sm font-semibold text-gray-500 mb-2">Purchase list detail</h3>
                          <div className="space-y-3 text-sm">
                              <div className="flex justify-between"><span className="text-gray-600">Daily Earnings</span><span className="font-semibold text-gray-800">₹{(selectedPlan.dailyReturn * quantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                              <div className="flex justify-between"><span className="text-gray-600">Total Earnings</span><span className="font-semibold text-gray-800">₹{(selectedPlan.dailyReturn * selectedPlan.duration * quantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                          </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-b py-4">
                          <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md text-2xl text-gray-600 hover:bg-gray-200">-</button>
                          <span className="text-xl font-bold">{quantity}</span>
                          <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md text-2xl text-gray-600 hover:bg-gray-200">+</button>
                      </div>
                  </div>

                  <footer className="p-4 border-t shrink-0">
                      <div className="text-xs text-gray-500 flex items-start gap-2 mb-4">
                          <span className="text-green-500 mt-0.5">•</span>
                          <p>Investing in {appName} not only allows investors to capitalize on the rapid growth of sustainable energy and green mobility, but also benefits from diversified revenue streams, technological innovation, environmental value, and stable cash flow. Furthermore, as an ESG-focused company, {appName} offers an ideal option for investors seeking long-term, responsible investments.</p>
                      </div>
                      <div className="flex gap-3">
                          <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-green-500 rounded-lg font-semibold text-green-600 hover:bg-green-50 transition">Cancel</button>
                          <button onClick={confirmInvestment} className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition">Invest Now ₹{(selectedPlan.minInvestment * quantity).toFixed(2)}</button>
                      </div>
                  </footer>
              </div>
              <style>{`
                  @keyframes slide-up {
                      from { transform: translateY(100%); }
                      to { transform: translateY(0); }
                  }
                  .animate-slide-up { animation: slide-up 0.3s ease-out; }
              `}</style>
          </div>
      )}

      <BottomNav active="invest" />
    </div>
  );
};

export default InvestmentScreen;