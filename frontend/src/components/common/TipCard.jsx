
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TipCard = ({ tip, childName }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Default values if tip is missing or structure is different
    const tipText = tip?.text || "Try to include at least 3 different colors of vegetables in dinner today to boost antioxidant intake!";
    const tipTag = tip?.tag || "Daily Tip";
    // Mock explanation if not provided (since backend might not provide it yet)
    const explanation = tip?.explanation || `This helps build a strong immune system and keeps ${childName || 'your child'} energetic throughout the day. Colorful vegetables provide essential vitamins and antioxidants that are crucial for growth. Consistent healthy eating habits formed now will benefit them for a lifetime.`;

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-primary p-1 rounded-3xl text-white shadow-xl overflow-hidden relative group h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-500"></div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-[1.3rem] h-full flex flex-col relative z-10 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-md shadow-inner">
                        <span className="material-symbols-outlined text-2xl text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]">lightbulb</span>
                    </div>
                    <span className="text-[10px] font-black bg-white text-primary px-3 py-1 rounded-full uppercase tracking-widest shadow-sm border border-white/50">
                        {tipTag}
                    </span>
                </div>

                <h4 className="text-xl font-black mb-3 leading-tight tracking-tight">
                    {childName ? `For ${childName}:` : 'Healthy Eating'}
                </h4>

                <p className="text-white/95 leading-relaxed font-medium mb-4 text-sm md:text-base border-l-4 border-white/30 pl-3">
                    "{tipText}"
                </p>

                <div className="mt-auto">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-100 hover:text-white transition-colors group/btn bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg w-fit"
                    >
                        <span className="material-symbols-outlined text-lg group-hover/btn:rotate-180 transition-transform duration-300">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                        {isExpanded ? 'Close Explaination' : 'Why this is important'}
                    </button>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-3 pt-3 border-t border-white/20 text-sm text-indigo-50 leading-relaxed font-medium">
                                    <p>{explanation}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default TipCard;
