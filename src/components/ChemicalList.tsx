import React from 'react';
   import { useTheme } from '../context/ThemeContext';
   import { useTranslation } from '../utils/i18n';
   import { MinusCircle, PlusCircle, Droplets } from 'lucide-react';
   import { Button } from "@/components/ui/button";

   interface ChemicalWithQuantity {
     id: string;
     name: string;
     nameAr: string;
     color: string;
     state: 'solid' | 'liquid' | 'gas';
     quantity: number;
     density: number;
     formula: string;
   }

   interface ChemicalListProps {
     chemicals: ChemicalWithQuantity[];
     isReacting: boolean;
     onUpdateQuantity: (index: number, amount: number) => void;
   }

   const ChemicalList = ({ chemicals, isReacting, onUpdateQuantity }: ChemicalListProps) => {
     const { language } = useTheme();
     const { t } = useTranslation();

     if (chemicals.length === 0) {
       return (
         <div className="text-muted-foreground text-sm italic px-3 py-2">
           {t('no.chemicals')}
         </div>
       );
     }

     return (
       <div className="flex flex-col gap-2 overflow-y-auto">
         {chemicals.map((chemical, index) => (
           <div
             key={`${chemical.id}-${index}`}
             className="px-3 py-2 rounded-lg text-xs bg-secondary text-secondary-foreground flex flex-col w-full"
           >
             <div className="flex items-center justify-between">
               <div className="flex items-center">
                 <span
                   className="w-3 h-3 rounded-full mr-2"
                   style={{ backgroundColor: chemical.color }}
                 ></span>
                 <span>
                   {language === 'en' ? chemical.name : chemical.nameAr}
                 </span>
               </div>
             </div>
             <div className="flex items-center justify-between mt-1">
               <span className="text-xs text-muted-foreground flex items-center">
                 <Droplets className="w-3 h-3 mr-1" />
                 {t('quantity')}: {chemical.quantity} ml
               </span>
               <div className="flex items-center gap-1">
                 <Button
                   variant="ghost"
                   size="icon"
                   onClick={() => onUpdateQuantity(index, -0.5)}
                   disabled={isReacting || chemical.quantity <= 0.5}
                 >
                   <MinusCircle className="w-4 h-4" />
                 </Button>
                 <Button
                   variant="ghost"
                   size="icon"
                   onClick={() => onUpdateQuantity(index, 0.5)}
                   disabled={isReacting || chemical.quantity >= 10}
                 >
                   <PlusCircle className="w-4 h-4" />
                 </Button>
               </div>
             </div>
           </div>
         ))}
       </div>
     );
   };

   export default ChemicalList;