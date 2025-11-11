/**
 * AbilityScoresStep Component
 * 
 * Wrapper for Step1AbilityScores in the Character Creation Wizard.
 * Integrates the existing ability score assignment UI into the wizard workflow.
 * 
 * @module CharacterGenerator/creationDrawerComponents
 */

import React from 'react';
import { Step1AbilityScores } from '../components/Step1AbilityScores';

const AbilityScoresStep: React.FC = () => {
    return <Step1AbilityScores />;
};

export default AbilityScoresStep;





