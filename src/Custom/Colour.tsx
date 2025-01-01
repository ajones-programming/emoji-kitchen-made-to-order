import { colour } from "./types";

export class Colour{

    private r : number = 0;
    private g : number = 0;
    private b : number = 0;

    constructor(_colour : colour){
        this.r = _colour.r;
        this.g = _colour.g;
        this.b = _colour.b;
    }

    public static Inherit(colour1? : Colour, colour2? : Colour){
        if (!colour1 || !colour2){
            return colour1 ?? colour2;
        }
        return new Colour({r: (colour1.r + colour2.r)/2, g: (colour1.g + colour2.g)/2, b: (colour1.b + colour2.b)/2})
    }

    public static IsEqual(colour1? : Colour, colour2? : Colour){
        if (!colour1 || !colour2){
            return colour1 == colour2;
        }
        return colour1.r === colour2.r &&colour1.g === colour2.g && colour1.b === colour2.b;
    }

    public getColour() : colour{
        return {r : this.r, g: this.g, b: this.b };
    }

}