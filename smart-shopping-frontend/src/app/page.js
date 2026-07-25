"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { submitShoppingList, fetchSavedList, searchItemApi, deleteItem, clearList } from "./services/api";

export default function Home() {
  const [items, setItems] = useState([{ name: "", price: "" }]);
  const [discount, setDiscount] = useState(0);
  const [budget, setBudget] = useState(1000);
  const [resultData, setResultData] = useState(null);
  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    try {
      const data = await fetchSavedList();
      setSavedData(data);
    } catch (err) {
      console.log("Backend warming up...");
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => setItems([...items, { name: "", price: "" }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedItems = items.map(i => ({ name: i.name, price: parseFloat(i.price) || 0 }));
      const payload = { items: formattedItems, discount: parseFloat(discount) || 0, budget: parseFloat(budget) || 0 };
      const res = await submitShoppingList(payload);
      setResultData(res);
      loadSaved();
    } catch (err) {
      alert("Error submitting list to backend");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await searchItemApi(searchQuery);
      setSearchResults(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (name) => {
    await deleteItem(name);
    loadSaved();
  };

  const handleClear = async () => {
    await clearList();
    setResultData(null);
    setSearchResults(null);
    loadSaved();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 p-4 sm:p-8 lg:p-12">
      <motion.div 
        initial={{ opacity: 0, y: -15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        
        {/* Header Section */}
        <header className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              🛒 Smart Shopping & Budget AI
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              Powered by FastAPI, Pandas, Nextjs & Gemini AI
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClear} 
            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold hover:bg-rose-500/20 transition shadow-sm"
          >
            Clear All Data
          </motion.button>
        </header>

        {/* Main Dashboard Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Configure & Search Controls (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Configure List Card */}
            <motion.div 
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6"
            >
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Configure List</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Budget (PKR)</label>
                  <input 
                    type="number" 
                    value={budget} 
                    onChange={(e) => setBudget(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Discount (%)</label>
                  <input 
                    type="number" 
                    value={discount} 
                    onChange={(e) => setDiscount(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Products & Prices</label>
                  
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {items.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        key={idx} 
                        className="flex gap-2"
                      >
                        <input 
                          type="text" 
                          placeholder="Item name" 
                          value={item.name} 
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)} 
                          className="w-3/5 px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                        />
                        <input 
                          type="number" 
                          placeholder="Price" 
                          value={item.price} 
                          onChange={(e) => handleItemChange(idx, "price", e.target.value)} 
                          className="w-2/5 px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                        />
                      </motion.div>
                    ))}
                  </div>

                  <button 
                    type="button" 
                    onClick={addItemRow} 
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition pt-1 block"
                  >
                    + Add another item
                  </button>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 py-3.5 rounded-2xl font-black shadow-lg shadow-emerald-600/20 transition text-sm"
                >
                  {loading ? "Optimizing with AI..." : "Calculate & Optimize 🚀"}
                </motion.button>
              </form>
            </motion.div>

            {/* Search Item Card */}
            <motion.div 
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4"
            >
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Search Saved Item</h2>
              
              <form onSubmit={handleSearch} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. apple" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md"
                >
                  Search
                </button>
              </form>

              <AnimatePresence>
                {searchResults && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-xs space-y-2"
                  >
                    {searchResults.results ? (
                      searchResults.results.map((r, i) => (
                        <div key={i} className="flex justify-between items-center font-medium">
                          <span className="text-slate-200">{r.name}</span>
                          <span className="text-emerald-400 font-bold">{r.final_price} PKR <span className="text-slate-500 font-normal">({r.category})</span></span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-1">{searchResults.message}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </div>

          {/* Right Column: Results & Analytics Dashboards (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Evaluation Summary */}
            <AnimatePresence>
              {resultData && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6"
                >
                  <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Evaluation Summary</h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                      <p className="text-xs font-medium text-slate-400">Total Cost</p>
                      <p className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
                        {resultData.summary.total_cost} <span className="text-xs font-normal text-slate-400">PKR</span>
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                      <p className="text-xs font-medium text-slate-400">Remaining</p>
                      <p className={`text-xl sm:text-2xl font-black mt-1 ${resultData.summary.remaining_budget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {resultData.summary.remaining_budget} <span className="text-xs font-normal text-slate-400">PKR</span>
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                      <p className="text-xs font-medium text-slate-400">Average Price</p>
                      <p className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
                        {resultData.summary.average_price.toFixed(1)}
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                      <p className="text-xs font-medium text-slate-400">Fits Budget?</p>
                      <p className={`text-xl sm:text-2xl font-black mt-1 ${resultData.summary.fits_budget ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {resultData.summary.fits_budget ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  {resultData.summary.budget_alert && (
                    <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-r-2xl text-rose-300 text-sm font-medium">
                      {resultData.summary.budget_alert}
                    </div>
                  )}

                  {resultData.summary.optimization && (
                    <div className="bg-emerald-950/30 border border-emerald-900/50 p-5 rounded-2xl text-emerald-100 text-sm">
                      <p className="font-bold mb-2 flex items-center gap-2 text-emerald-400">
                        <span>✨</span> Gemini AI Optimization Tip:
                      </p>
                      <div className="prose prose-invert prose-sm text-slate-300 max-w-none">
                        <ReactMarkdown>{resultData.summary.optimization}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pandas Analytics Dashboard */}
            {savedData?.analytics && (
              <motion.div 
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6"
              >
                <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Pandas Analytics Dashboard</h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-xs font-medium text-emerald-400">Min Item Price</p>
                    <p className="text-lg font-black text-slate-100 mt-1">{savedData.analytics.min_price} PKR</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-xs font-medium text-emerald-400">Max Item Price</p>
                    <p className="text-lg font-black text-slate-100 mt-1">{savedData.analytics.max_price} PKR</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-xs font-medium text-emerald-400">Avg Saved Price</p>
                    <p className="text-lg font-black text-slate-100 mt-1">{savedData.analytics.average_price.toFixed(1)} PKR</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-xs font-medium text-emerald-400">Top Category</p>
                    <p className="text-lg font-black text-emerald-300 mt-1">{savedData.analytics.top_category}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Spending Per Category:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(savedData.analytics.spending_per_category).map(([cat, amt]) => (
                      <div key={cat} className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl text-xs flex justify-between items-center">
                        <span className="font-bold text-slate-300">{cat}</span>
                        <span className="text-emerald-400 font-semibold">{amt} PKR</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Saved Shopping Items Card */}
            <motion.div 
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6"
            >
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Saved Shopping Items</h2>
              
              {savedData?.message ? (
                <p className="text-slate-400 text-sm py-8 text-center">No saved items found yet. Add some items above!</p>
              ) : (
                <div className="space-y-6">
                  {savedData?.grouped && Object.entries(savedData.grouped).map(([category, items]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="font-extrabold text-xs text-emerald-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">
                        {category}
                      </h3>
                      <div className="space-y-2.5">
                        {items.map((item, idx) => (
                          <motion.div 
                            whileHover={{ scale: 1.01, backgroundColor: "rgba(2, 6, 23, 0.9)" }}
                            key={idx} 
                            className="flex justify-between items-center bg-slate-950/50 px-4 py-3 rounded-2xl transition border border-slate-800 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-200 text-sm">{item.name}</span>
                              <span className="text-slate-400 text-xs font-medium">({item.final_price} PKR)</span>
                            </div>
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(item.name)} 
                              className="text-rose-400 hover:text-rose-300 text-xs font-bold px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/20 transition shadow-sm"
                            >
                              Delete
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </motion.div>
    </main>
  );
}