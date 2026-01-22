import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Helper function to randomly select an element from an array
function getRandomElement<T>(array: T[]): T | null {
  if (array.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

// Helper function to randomly select multiple unique elements from an array
function getRandomElements<T>(array: T[], count: number): T[] {
  if (array.length === 0 || count <= 0) return [];
  
  // If we need more elements than available, return all
  if (count >= array.length) return [...array];
  
  // Create a copy of the array to avoid mutating the original
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('bleamies');
    const collection = db.collection('levels');

    // Fetch only Friends and Couples levels
    const levels = await collection
      .find({ 
        $or: [
          { name: 'Friends' },
          { level: 'Friends' },
          { name: 'Couples' },
          { level: 'Couples' }
        ]
      })
      .toArray();

    if (levels.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No levels found (Friends or Couples)',
        },
        { status: 404 }
      );
    }

    // Step 1: Randomly select a level (Friends or Couples)
    const selectedLevel = getRandomElement(levels);
    
    if (!selectedLevel || !selectedLevel.categories || selectedLevel.categories.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Selected level has no categories',
        },
        { status: 404 }
      );
    }

    // Step 2: Randomly select a category from the selected level
    const selectedCategory = getRandomElement(selectedLevel.categories) as any;
    
    if (!selectedCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'No category found in selected level',
        },
        { status: 404 }
      );
    }

    // Step 3: Extract questions from the category
    // Handle different possible structures:
    // - category.questions (array of strings or objects)
    // - category.questions.text (if questions are objects)
    let questions: string[] = [];
    
    if (Array.isArray(selectedCategory?.questions)) {
      questions = selectedCategory.questions.map((q: any) => {
        // If question is an object with a text/question field, extract it
        if (typeof q === 'object' && q !== null) {
          return q.text || q.question || q.content || JSON.stringify(q);
        }
        // If question is a string, return it directly
        return String(q);
      }).filter((q: string) => q.trim().length > 0);
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Selected category has no questions',
        },
        { status: 404 }
      );
    }

    // Step 4: Randomly select 4 questions (or all if less than 4)
    const selectedQuestions = getRandomElements(questions, 4);

    // Extract category name (could be name, category, or title field)
    const categoryName = selectedCategory?.name || 
                         selectedCategory?.category || 
                         selectedCategory?.title || 
                         'Unknown Category';

    // Extract level name
    const levelName = selectedLevel.name || selectedLevel.level || 'Unknown Level';

    // Extract instructions - check category first, then level
    let instructions: string[] = [];
    
    // Check if instructions exist in the category
    if (selectedCategory?.instructions) {
      if (Array.isArray(selectedCategory.instructions)) {
        instructions = selectedCategory.instructions.map((inst: any) => {
          if (typeof inst === 'object' && inst !== null) {
            return inst.text || inst.instruction || inst.content || JSON.stringify(inst);
          }
          return String(inst);
        }).filter((inst: string) => inst.trim().length > 0);
      } else if (typeof selectedCategory.instructions === 'string') {
        instructions = [selectedCategory.instructions];
      }
    }
    
    // If no instructions in category, check level
    if (instructions.length === 0 && selectedLevel.instructions) {
      if (Array.isArray(selectedLevel.instructions)) {
        instructions = selectedLevel.instructions.map((inst: any) => {
          if (typeof inst === 'object' && inst !== null) {
            return inst.text || inst.instruction || inst.content || JSON.stringify(inst);
          }
          return String(inst);
        }).filter((inst: string) => inst.trim().length > 0);
      } else if (typeof selectedLevel.instructions === 'string') {
        instructions = [selectedLevel.instructions];
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        levelName,
        categoryName,
        instructions,
        questions: selectedQuestions,
      },
    });
  } catch (error: any) {
    console.error('Error fetching random level questions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch random level questions',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
