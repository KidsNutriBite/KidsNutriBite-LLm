"use client";
import React, { useState, useEffect } from 'react';
import GuideCard from '../../components/resources/GuideCard';
import RecipeCard from '../../components/resources/RecipeCard';
import TipCard from '../../components/resources/TipCard';
import ResourceModal from '../../components/resources/ResourceModal';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const ResourcesLibrary = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [savedResources, setSavedResources] = useState(new Set());
    const [selectedResource, setSelectedResource] = useState(null);
    const [showSavedOnly, setShowSavedOnly] = useState(false);

    const [recommendations, setRecommendations] = useState(null);
    const [loadingPlans, setLoadingPlans] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await api.get('/meals/recommendations');
                setRecommendations(res.data.data);
            } catch (error) {
                console.error("Failed to fetch recommendations", error);
            } finally {
                setLoadingPlans(false);
            }
        };
        fetchRecommendations();
    }, []);

    const handleOpenResource = (resource) => setSelectedResource(resource);
    const handleCloseResource = () => setSelectedResource(null);

    const toggleSave = (id) => {
        setSavedResources(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
                toast.success('Removed from Saved Resources');
            } else {
                newSet.add(id);
                toast.success('Added to Saved Resources');
            }
            return newSet;
        });
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setShowSavedOnly(filter === 'Saved Resources');
    };

    const downloadPDF = () => {
        if (!recommendations) return;
        const doc = new jsPDF();
        let yPos = 20;

        doc.setFontSize(22);
        doc.setTextColor(43, 157, 238);
        doc.text("NutriKid Family Meal Plan", 20, yPos);
        yPos += 15;

        // Family Plan
        if (recommendations.familyPlan && recommendations.childPlans.length > 1) {
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text(recommendations.familyPlan.title, 20, yPos);
            yPos += 10;
            
            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100);
            const splitDesc = doc.splitTextToSize(recommendations.familyPlan.description, 170);
            doc.text(splitDesc, 20, yPos);
            yPos += (splitDesc.length * 6) + 5;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text("Shared Recommendations:", 20, yPos);
            yPos += 7;
            doc.setFontSize(10);
            recommendations.familyPlan.sharedRecommendations.forEach(r => {
                doc.text(`• ${r}`, 25, yPos);
                yPos += 6;
            });
            yPos += 5;
        }

        // Child Specific Plans
        recommendations.childPlans.forEach((child, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(16);
            doc.setTextColor(43, 157, 238);
            doc.text(`${child.name}'s Plan - ${child.focus}`, 20, yPos);
            yPos += 10;

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Weekly Plan:", 20, yPos);
            yPos += 5;

            const tableData = Object.entries(child.weeklyPlan).map(([day, meal]) => [day, meal]);
            
            doc.autoTable({
                startY: yPos,
                head: [['Day', 'Meals']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [43, 157, 238] },
                styles: { fontSize: 9 },
                margin: { left: 20, right: 20 }
            });
            
            yPos = doc.lastAutoTable.finalY + 15;
        });

        doc.save("NutriKid_Family_Meal_Plan.pdf");
        toast.success("PDF Downloaded Successfully");
    };

    // Hardcoded Data (unchanged)
    const guides = [
        { id: 'g1', title: 'The Iron-Rich Masterlist', description: 'Traditional Indian superfoods and cooking techniques to maximize iron absorption for your child.', tags: ['Mineral Focus', 'Vegetarian'], isSaved: false },
        { id: 'g2', title: 'The Balanced Indian Lunchbox', description: 'Quick strategies to pack nutrition-dense Indian lunches that stay fresh and tasty until recess.', tags: ['Lunchbox', 'School'], isSaved: false },
        { id: 'g3', title: 'Managing Picky Eating Desi Style', description: 'How to introduce new textures and flavors using familiar Indian spices and comfort foods.', tags: ['Behavior', 'Tips'], isSaved: false },
        { id: 'g4', title: 'Understanding Growth & BMI', description: 'A parent\'s guide to interpreting growth charts in the Indian context.', tags: ['Growth', 'Medical'], isSaved: false },
    ];

    const recipes = [
        { id: 'r1', title: 'Iron-Rich Palak Paneer Paratha', prepTime: '20 mins', nutrition: { iron: true, protein: true }, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=800' },
        { id: 'r2', title: 'Masala Roasted Makhana (Foxnuts)', prepTime: '10 mins', nutrition: { protein: true, fiber: true }, image: 'https://images.unsplash.com/photo-1606491956689-2ea287bc2a54?auto=format&fit=crop&q=80&w=800' },
        { id: 'r3', title: 'Mango & Chia Seed Lassi Bowl', prepTime: '05 mins', nutrition: { fiber: true, protein: true }, image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=800' },
        { id: 'r4', title: 'Moong Dal Chilla with Veggies', prepTime: '15 mins', nutrition: { protein: true, iron: true }, image: 'https://images.unsplash.com/photo-1626082927389-d609f427f715?auto=format&fit=crop&q=80&w=800' },
    ];

    const tips = [
        { id: 't1', title: 'Encouraging Veggie Eating', preview: 'How to sneak vegetables into parathas and dals without mealtime tantrums.' },
        { id: 't2', title: 'Desi Meal Prep for Busy Weeks', preview: 'Prepping batters and chutneys for a week of nutritious Indian breakfasts.' },
        { id: 't3', title: 'Decoding Indian Labels', preview: 'Identifying hidden additives in popular store-bought Indian snacks and drinks.' },
        { id: 't4', title: 'Healthy Snacking During Festivals', preview: 'Smart swaps for Diwali and Holi sweets to keep sugar intake in check.' },
    ];

    const filterResource = (resource) => {
        if (showSavedOnly) return savedResources.has(resource.id);
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Under 20 mins') return resource.prepTime && parseInt(resource.prepTime) <= 20;
        if (resource.tags && resource.tags.includes(activeFilter)) return true;
        return true;
    };

    const filteredGuides = guides.filter(filterResource);
    const filteredRecipes = recipes.filter(filterResource);
    const filteredTips = tips.filter(filterResource);

    return (
        <div className="space-y-12 pb-12">
            {/* 1. Hero Section - Targeted Nutrition Support */}
            {loadingPlans ? (
                <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl p-8 md:p-12 animate-pulse h-64 flex items-center justify-center">
                    <p className="text-slate-500 font-bold">Analyzing Family Nutrition Profiles...</p>
                </div>
            ) : recommendations && recommendations.childPlans.length > 0 ? (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden border border-blue-100 dark:border-slate-700 shadow-sm">
                    <div className="relative z-10 max-w-3xl">
                        <div className="flex flex-wrap gap-3 mb-4">
                            {recommendations.childPlans.map(child => (
                                <span key={child.profileId} className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {child.focus}
                                </span>
                            ))}
                            <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                ICMR Guidelines
                            </span>
                        </div>
                        <div className="mb-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Dashboard for {recommendations.childPlans.map(c => c.name).join(' & ')}
                        </div>
                        
                        {recommendations.childPlans.length > 1 ? (
                            <>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                                    {recommendations.familyPlan.title}
                                </h1>
                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                    {recommendations.familyPlan.description}
                                </p>
                                <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl mb-8 border border-white/40 dark:border-slate-700">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Key Strategy:</h3>
                                    <p className="text-sm text-slate-700 dark:text-slate-400">{recommendations.familyPlan.strategy}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                                    Targeted Nutrition Support
                                </h1>
                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                                    Based on {recommendations.childPlans[0].name}'s health profile ({recommendations.childPlans[0].focus}), we've curated traditional Indian recipes and nutritional guides to help boost health naturally.
                                </p>
                            </>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={downloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">download</span>
                                Download Weekly Nutrition Plan (PDF)
                            </button>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none hidden md:block">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-blue-500">
                            <path fill="#0F62FE" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.8,32.4C59.4,43.3,47.9,52.2,35.6,58.5C23.3,64.8,10.2,68.5,-2.1,72.1C-14.4,75.7,-25.9,79.2,-36.1,73.8C-46.3,68.4,-55.2,54.1,-63.5,40.5C-71.8,26.9,-79.5,14,-80.6,0.5C-81.7,-13,-76.2,-27.1,-67.2,-39.3C-58.2,-51.5,-45.7,-61.8,-32.3,-69.5C-18.9,-77.2,-4.6,-82.3,4.9,-90.8L44.7,-76.4Z" transform="translate(100 100)" />
                        </svg>
                    </div>
                </div>
            ) : null}

            {/* Sticky Filter Bar */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-slate-100 dark:border-slate-800 mb-8 overflow-x-auto">
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => handleFilterChange('Saved Resources')}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeFilter === 'Saved Resources'
                            ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        <span className={`material-symbols-outlined text-lg ${activeFilter === 'Saved Resources' ? 'fill-current' : ''}`}>favorite</span>
                        Saved Resources
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    {['All', 'Under 20 mins', 'Desi Toddler-friendly', 'Doctor Recommended', 'Lactose Free'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => handleFilterChange(filter)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${activeFilter === filter
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Indian Nutrition Guides */}
            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Indian Nutrition Guides</h2>
                    <button className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline flex items-center gap-1">
                        See all guides
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGuides.length > 0 ? filteredGuides.map(guide => (
                        <GuideCard
                            key={guide.id}
                            {...guide}
                            isSaved={savedResources.has(guide.id)}
                            onToggleSave={() => toggleSave(guide.id)}
                            onClick={() => handleOpenResource(guide)}
                        />
                    )) : (
                        activeFilter === 'Saved Resources' && <p className="col-span-full text-slate-500 italic">No saved guides yet.</p>
                    )}
                </div>
            </section>

            {/* 3. Healthy Indian Recipes */}
            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Healthy Indian Recipes For You</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredRecipes.length > 0 ? filteredRecipes.map(recipe => (
                        <RecipeCard
                            key={recipe.id}
                            {...recipe}
                            isSaved={savedResources.has(recipe.id)}
                            onToggleSave={() => toggleSave(recipe.id)}
                            onClick={() => handleOpenResource(recipe)}
                        />
                    )) : (
                        activeFilter === 'Saved Resources' && <p className="col-span-full text-slate-500 italic">No saved recipes yet.</p>
                    )}
                </div>
            </section>

            {/* 4. Parenting Tips */}
            <section>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Indian Parenting Tips & Tricks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {filteredTips.length > 0 ? filteredTips.map(tip => (
                        <TipCard
                            key={tip.id}
                            {...tip}
                            isSaved={savedResources.has(tip.id)}
                            onToggleSave={() => toggleSave(tip.id)}
                            onClick={() => handleOpenResource(tip)}
                        />
                    )) : (
                        activeFilter === 'Saved Resources' && <p className="col-span-full text-slate-500 italic">No saved tips yet.</p>
                    )}
                </div>
            </section>

            <ResourceModal
                isOpen={!!selectedResource}
                onClose={handleCloseResource}
                resource={selectedResource}
                isSaved={selectedResource ? savedResources.has(selectedResource.id) : false}
                onToggleSave={() => selectedResource && toggleSave(selectedResource.id)}
            />
        </div>
    );
};

export default ResourcesLibrary;
