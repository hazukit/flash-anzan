import type { Problem, OperationType, DifficultySettings } from '../types';

export const generateProblem = (settings: DifficultySettings): Problem => {
  const { operations, maxDigits } = settings;
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  const min = Math.pow(10, maxDigits - 1);
  const max = Math.pow(10, maxDigits) - 1;
  
  let numbers: number[];
  let correctAnswer: number;
  
  switch (operation) {
    case 'addition':
      // 2つの数字の足し算
      numbers = Array.from({ length: 2 }, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
      );
      correctAnswer = numbers[0] + numbers[1];
      break;
      
    case 'subtraction':
      // 2つの数字の引き算（負の数にならないよう大きい数から小さい数を引く）
      numbers = Array.from({ length: 2 }, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
      );
      numbers.sort((a, b) => b - a);
      correctAnswer = numbers[0] - numbers[1];
      break;
      
    case 'multiplication':
      // 2つの数字の掛け算（結果が大きくなりすぎないよう調整）
      if (maxDigits <= 2) {
        numbers = Array.from({ length: 2 }, () => 
          Math.floor(Math.random() * Math.min(max, 20)) + 1
        );
      } else {
        numbers = Array.from({ length: 2 }, () => 
          Math.floor(Math.random() * Math.min(max, 50)) + 1
        );
      }
      correctAnswer = numbers[0] * numbers[1];
      break;
      
    case 'division':
      // 2つの数字の割り算（整数になるよう調整）
      const divisor = Math.floor(Math.random() * 9) + 2;
      const quotient = Math.floor(Math.random() * (max / divisor)) + 1;
      const dividend = divisor * quotient;
      numbers = [dividend, divisor];
      correctAnswer = quotient;
      break;
      
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
  
  return {
    numbers,
    operation,
    correctAnswer
  };
};

export const formatProblemDisplay = (problem: Problem): string => {
  const { numbers, operation } = problem;
  
  switch (operation) {
    case 'addition':
      return numbers.join(' + ');
    case 'subtraction':
      return numbers.join(' - ');
    case 'multiplication':
      return numbers.join(' × ');
    case 'division':
      return numbers.join(' ÷ ');
    default:
      return '';
  }
};

export const getOperationSymbol = (operation: OperationType): string => {
  switch (operation) {
    case 'addition': return '+';
    case 'subtraction': return '-';
    case 'multiplication': return '×';
    case 'division': return '÷';
    default: return '';
  }
};

export const getOperationLabel = (operation: OperationType): string => {
  switch (operation) {
    case 'addition': return '足し算';
    case 'subtraction': return '引き算';
    case 'multiplication': return '掛け算';
    case 'division': return '割り算';
    default: return '';
  }
};