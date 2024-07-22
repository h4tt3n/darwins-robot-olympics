"use strict";

// ******************************************************
//   Utility toolbox version 0.1
// ******************************************************

class ToolBox {

    // ******************************************************
    //   Array functions
    // ******************************************************

    static randomElementFromArray(array) {
        let i = Math.floor(Math.random() * array.length);
        return array[i];
    }

    static fisherYatesShuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    static durstenfeldShuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    static insideOutShuffle(array) {
        for (let i = 0; i < array.length; i++) {
            const j = i + Math.floor(Math.random() * (array.length - i));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    static sandraSattoloShuffle(array) {
        for (let i = 0; i < array.length; i++) {
            let j = Math.floor(Math.random() * array.length);
            if (i !== j) {
                const temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }
        return array;
    }


    // ******************************************************
    //   Randomizing functions
    // ******************************************************

    static randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomFloatBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomGaussian(mean = 0, stdev = 1) {
        const u = 1 - Math.random(); // Converting [0,1) to (0,1]
        const v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        // Transform to the desired mean and standard deviation:
        return z * stdev + mean;
    }


    // ******************************************************
    //   String and Character functions
    // ******************************************************

    // Add char at index to string (strings are immutable)
    static setCharAt(str, index, chr) {
        if (index > str.length - 1) return str;
        return str.substring(0, index) + chr + str.substring(index + 1);
    }

    static charToAscii(char) {
        return char.charCodeAt(0);
    }

    static asciiToChar(ascii) {
        return String.fromCharCode(ascii);
    }

    static randomChar() {
        // Daniel Shiffman's approach
        let c = Math.floor(randomIntBetween(63, 122));
        if (c === 63) c = 32; // space instead of question mark
        if (c === 64) c = 46; // period instead of @ sign
        return String.fromCharCode(c);
    }

    static randomPrintableAsciiChar() {
        let asciiCode = randomIntBetween(32, 126);
        return String.fromCharCode(asciiCode);
    }

    static randomAsciiLetter() {
        let asciiCode = randomIntBetween(65, 122);
        while (asciiCode > 90 && asciiCode < 97) {
            asciiCode = randomIntBetween(65, 122);
        }
        return String.fromCharCode(asciiCode);
    }

    static randomCharFromString(string) {
        let randomIndex = Math.floor(Math.random() * string.length);
        return string.charAt(randomIndex);
    }


    // ******************************************************
    //   Miscelaneous functions
    // ******************************************************
    static isJsonObject(strData) {
        try {
            JSON.parse(strData);
        } catch (e) {
            return false;
        }
        return true;
    }

    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    static map(value, start1, stop1, start2, stop2) {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    }

    static encodeRealValueToUnitRange(value, min, max) {
        return (value - min) / (max - min);
    }
    
    static decodeUnitRangeToRealValue(encoded, min, max) {
        return encoded * (max - min) + min;
    }

    // static map(value, input1, input2, output1, output2) {
    //     return (value - input1) * (output2 - output1) / (input2 - input1) + output1;
    // }

    // round float to n decimal places
    static round(value, decimals) {
        //return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
        return Number(value.toFixed(decimals));
        //return Math.round((value + Number.EPSILON) * 100) / 100;
        //return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }


    // ******************************************************
    //   RGB and HSL color functions
    // ******************************************************

    static getRandomColorRGB(min, max) {
        let r = Math.floor(random(min, max));
        let g = Math.floor(random(min, max));
        let b = Math.floor(random(min, max));
        return { r: r, g: g, b: b };
    }

    static getRandomColorHSL() {
        let h = Math.floor(Math.random() * 360);
        let s = Math.floor(Math.random() * 100);
        let l = Math.floor(Math.random() * 100);
        return { h: h, s: s, l: l };
    }

    static RgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s * 100, l * 100];
    }

    static HslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = HueToRgb(p, q, h + 1 / 3);
            g = HueToRgb(p, q, h);
            b = HueToRgb(p, q, h - 1 / 3);
        }

        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }

    static HueToRgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }


    // ******************************************************
    //   JavaScript specific functions
    // ******************************************************

    static constructorName(value){
        return value.constructor.name;
    }

    static myTypeOf(value) {
        
        let instanceOf = value.constructor.name;
        let typeOf = typeof(value);
        let constTypeOf = null;

        //let constTypeStr = new String(value.constructor).slice(9,10);
        let constTypeStr = new String(value.constructor).charAt(9);

        switch(constTypeStr){
            case "A": constTypeOf = "Array"; break;
            case "B": constTypeOf = "Boolean"; break;
            case "D": constTypeOf = "Date"; break;
            case "F": constTypeOf = "Function"; break;
            case "N": constTypeOf = "Number"; break;
            case "O": constTypeOf = "Object"; break;
            case "S": constTypeOf = "String"; break;
            default: constTypeOf = "Undefined";
        };

        return instanceOf//constTypeOf === "Undefined" ? typeOf : constTypeOf;
    }
};

export { ToolBox };
