import fs from 'fs';
import path from 'path';
import { Category } from './domain/entities/Category';
import { DataSet } from './domain/entities/DataSet';
import { DataElement } from './domain/entities/DataElement';
import { CategoryOption } from './domain/entities/CategoryOption';
import { CategoryOptionCombo } from './domain/entities/CategoryOptionCombo';
import { LegendSet } from './domain/entities/LegendSet';
import { Section } from './domain/entities/Section';

// ... existing imports ...

function validateStructure(): void {
    try {
        const rawData = fs.readFileSync(
            path.join(__dirname, '../capture/ds-noncommunicable-diseases.json'),
            'utf-8'
        );
        const sourceData = JSON.parse(rawData);

        // Define the expected keys for each interface
        const interfaceKeys = {
            DataSet: ['id', 'name', 'periodType', 'categoryCombo', 'dataSetElements', 'sections'],
            DataElement: ['id', 'name', 'valueType', 'domainType', 'aggregationType', 'categoryCombo'],
            Category: ['id', 'name', 'categoryOptions'],
            CategoryOption: ['id', 'name'],
            CategoryOptionCombo: ['id', 'name', 'categoryCombo'],
            LegendSet: ['id', 'name', 'legends'],
            Section: ['id', 'name', 'dataElements']
        };

        // Validate each type against its expected keys
        function validateObject(obj: unknown, expectedKeys: string[], label: string): void {
            const actualKeys = Object.keys(obj as object);
            
            console.log(`\n=== Validating ${label} ===`);
            
            // Check for missing required fields
            const missingKeys = expectedKeys.filter(key => !actualKeys.includes(key));
            if (missingKeys.length > 0) {
                console.log(`❌ Missing required fields: ${missingKeys.join(', ')}`);
            }
            
            // Check for extra fields
            const extraKeys = actualKeys.filter(key => !expectedKeys.includes(key));
            if (extraKeys.length > 0) {
                console.log(`ℹ️  Extra fields found: ${extraKeys.join(', ')}`);
            }

            if (missingKeys.length === 0 && extraKeys.length === 0) {
                console.log('✅ All fields match the interface');
            }
        }

        // Validate each sample
        validateObject(sourceData.dataSets[0], interfaceKeys.DataSet, 'DataSet');
        validateObject(sourceData.dataElements[0], interfaceKeys.DataElement, 'DataElement');
        validateObject(sourceData.categories[0], interfaceKeys.Category, 'Category');
        validateObject(sourceData.categoryOptions[0], interfaceKeys.CategoryOption, 'CategoryOption');
        validateObject(sourceData.categoryOptionCombos[0], interfaceKeys.CategoryOptionCombo, 'CategoryOptionCombo');
        
        if (sourceData.legendSets?.[0]) {
            validateObject(sourceData.legendSets[0], interfaceKeys.LegendSet, 'LegendSet');
        }
        
        validateObject(sourceData.sections[0], interfaceKeys.Section, 'Section');

    } catch (error) {
        console.error('Error validating structure:', error);
        throw error;
    }
}

// Execute the function
validateStructure();