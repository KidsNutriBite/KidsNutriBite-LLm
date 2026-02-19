// Utility functions for growth calculations
// Based on WHO Child Growth Standards (0-5 years) and WHO Reference (5-19 years)
// Source: WHO BMI-for-age tables (Simplified for boys and girls)

// Z-Score Data Points (Simplified for MVP - specific ages in months)
// Format: { month: [SD-3, SD-2, SD-1, Median, SD+1, SD+2, SD+3] }
// SD-2 (3rd percentile) = Underweight threshold
// SD+1 (85th percentile) = Overweight threshold
// SD+2 (97th percentile) = Obese threshold

const WHO_BMI_BOYS = {
    0: [11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0], // Birth
    12: [13.4, 14.5, 15.8, 17.2, 18.7, 20.4, 22.2], // 1 year
    24: [12.8, 13.8, 14.8, 16.0, 17.4, 18.9, 20.6], // 2 years
    36: [12.4, 13.3, 14.3, 15.4, 16.7, 18.1, 19.7], // 3 years
    48: [12.1, 13.0, 14.0, 15.0, 16.2, 17.6, 19.1], // 4 years
    60: [12.0, 12.8, 13.7, 14.7, 15.9, 17.2, 18.7], // 5 years
    72: [12.0, 12.8, 13.6, 14.6, 15.8, 17.2, 18.9], // 6 years
    96: [12.1, 13.0, 13.9, 15.0, 16.4, 18.2, 20.6], // 8 years
    120: [12.5, 13.4, 14.5, 15.8, 17.5, 19.8, 22.9], // 10 years
    144: [13.3, 14.4, 15.7, 17.3, 19.4, 22.2, 25.8], // 12 years
    168: [14.2, 15.6, 17.2, 19.2, 21.8, 25.0, 28.9], // 14 years
    192: [15.2, 16.8, 18.7, 20.9, 23.9, 27.2, 30.8], // 16 years
    216: [16.0, 17.8, 19.8, 22.2, 25.4, 28.7, 32.1], // 18 years
    228: [16.2, 18.1, 20.2, 22.6, 25.8, 29.1, 32.5]  // 19 years
};

const WHO_BMI_GIRLS = {
    0: [10.8, 11.8, 12.8, 13.8, 14.8, 15.8, 16.8],
    12: [13.0, 14.0, 15.3, 16.6, 18.1, 19.7, 21.5],
    24: [12.5, 13.5, 14.5, 15.7, 17.1, 18.6, 20.3],
    36: [12.2, 13.1, 14.1, 15.2, 16.5, 17.9, 19.5],
    48: [11.9, 12.8, 13.8, 14.9, 16.2, 17.6, 19.2],
    60: [11.7, 12.6, 13.5, 14.6, 15.9, 17.4, 19.1], // 5 years
    72: [11.7, 12.5, 13.4, 14.5, 15.9, 17.6, 19.7], // 6 years
    96: [11.9, 12.7, 13.8, 15.0, 16.6, 18.8, 21.7], // 8 years
    120: [12.4, 13.4, 14.6, 16.1, 18.0, 20.7, 24.1], // 10 years
    144: [13.2, 14.5, 16.0, 17.9, 20.2, 23.3, 27.2], // 12 years
    168: [14.3, 15.8, 17.6, 19.8, 22.5, 25.9, 29.7], // 14 years
    192: [15.1, 16.8, 18.9, 21.3, 24.2, 27.6, 31.0], // 16 years
    216: [15.4, 17.3, 19.5, 22.0, 25.0, 28.3, 31.5], // 18 years
    228: [15.4, 17.3, 19.6, 22.1, 25.1, 28.4, 31.6]  // 19 years
};

export const calculateBMI = (weightKg, heightCm) => {
    if (!weightKg || !heightCm) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return parseFloat(bmi.toFixed(1));
};

export const calculateAgeInMonths = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();

    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += today.getMonth();

    if (today.getDate() < birthDate.getDate()) {
        months--;
    }
    return Math.max(0, months);
};

// Interpolate values for exact months
const getInterpolatedParams = (genderTable, ageMonths) => {
    const months = Object.keys(genderTable).map(Number).sort((a, b) => a - b);

    // Find lower and upper bounds
    let lower = months[0];
    let upper = months[months.length - 1];

    for (let i = 0; i < months.length - 1; i++) {
        if (ageMonths >= months[i] && ageMonths <= months[i + 1]) {
            lower = months[i];
            upper = months[i + 1];
            break;
        }
    }

    if (lower === upper) return genderTable[lower];

    // Linear interpolation
    const ratio = (ageMonths - lower) / (upper - lower);
    const lowerParams = genderTable[lower];
    const upperParams = genderTable[upper]; // [SD-3, ... SD+3]

    return lowerParams.map((val, idx) => {
        return val + (upperParams[idx] - val) * ratio;
    });
};

export const calculatePercentileAndRisk = (ageInMonths, bmi, gender = 'boy') => {
    // 1. Select Table
    const table = (gender === 'girl') ? WHO_BMI_GIRLS : WHO_BMI_BOYS;

    // 2. Get Reference Values (Interpolated)
    // Values correspond to: [SD-3, SD-2, SD-1, Median, SD+1, SD+2, SD+3]
    const refs = getInterpolatedParams(table, ageInMonths);

    const [sd3_neg, sd2_neg, sd1_neg, median, sd1_pos, sd2_pos, sd3_pos] = refs;

    // 3. Determine Risk Status
    let riskStatus = 'normal';
    let percentile = 50; // Default

    if (bmi < sd2_neg) {
        riskStatus = 'underweight'; // < 3rd percentile
        percentile = 3;
    } else if (bmi >= sd1_pos && bmi < sd2_pos) {
        riskStatus = 'overweight'; // > 85th percentile
        percentile = 85;
    } else if (bmi >= sd2_pos) {
        riskStatus = 'obese'; // > 97th percentile
        percentile = 97;
    } else {
        riskStatus = 'normal';
        // Approximate percentile between SD-2 and SD+1 (3rd to 85th)
        // This is a rough linear map for UI display purposes
        if (bmi < median) {
            // Map [SD-2 ... Median] to [3 ... 50]
            const ratio = (bmi - sd2_neg) / (median - sd2_neg);
            percentile = 3 + (ratio * 47);
        } else {
            // Map [Median ... SD+1] to [50 ... 85]
            const ratio = (bmi - median) / (sd1_pos - median);
            percentile = 50 + (ratio * 35);
        }
    }

    return {
        percentile: parseFloat(percentile.toFixed(1)),
        riskStatus,
        bmi,
        referenceValues: {
            median: parseFloat(median.toFixed(1)),
            cutoff_underweight: parseFloat(sd2_neg.toFixed(1)),
            cutoff_overweight: parseFloat(sd1_pos.toFixed(1)),
            cutoff_obese: parseFloat(sd2_pos.toFixed(1))
        }
    };
};
