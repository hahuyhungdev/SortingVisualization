import { useCallback, useEffect, useState } from 'react'

interface SortingStep {
  array: number[]
  comparedIndices: number[]
  swappedIndices: number[]
  sortedIndices: number[]
  message: string
}

const SortingVisualization = () => {
  const [array, setArray] = useState<number[]>([7, 8, 10, 1, 5, 20, 3, 2, 6, 4, 9])
  const [inputValue, setInputValue] = useState<string>('')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('quickSort')
  const [sortingSteps, setSortingSteps] = useState<SortingStep[]>([])
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(1000) // milliseconds per step

  const generateRandomArray = (length = 10) => {
    const newArray = Array.from({ length }, () => Math.floor(Math.random() * 50) + 1)
    setArray(newArray)
    setInputValue(newArray.join(', '))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleArraySubmit = () => {
    try {
      const newArray = inputValue.split(',').map((num) => {
        const parsed = parseInt(num.trim())
        if (isNaN(parsed)) throw new Error('Invalid number')
        return parsed
      })
      setArray(newArray)
      setCurrentStep(0)
      setIsPlaying(false)
    } catch (error) {
      alert('Please enter valid numbers separated by commas')
    }
  }

  // Sorting Algorithm Implementations
  const generateQuickSortSteps = useCallback((arr: number[]): SortingStep[] => {
    const steps: SortingStep[] = []
    const sortedIndices: number[] = []

    const partition = (arr: number[], low: number, high: number): number => {
      const pivotIndex = high
      const pivot = arr[pivotIndex]
      let i = low - 1

      for (let j = low; j < high; j++) {
        steps.push({
          array: [...arr],
          comparedIndices: [j, pivotIndex],
          swappedIndices: [],
          sortedIndices: [...sortedIndices],
          message: `Comparing ${arr[j]} with pivot ${pivot}`
        })

        if (arr[j] <= pivot) {
          i++
          if (i !== j) {
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
            steps.push({
              array: [...arr],
              comparedIndices: [],
              swappedIndices: [i, j],
              sortedIndices: [...sortedIndices],
              message: `Swapping ${arr[i]} and ${arr[j]}`
            })
          }
        }
      }

      ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
      steps.push({
        array: [...arr],
        comparedIndices: [],
        swappedIndices: [i + 1, high],
        sortedIndices: [...sortedIndices],
        message: `Placing pivot ${pivot} in its final position`
      })

      return i + 1
    }

    const quickSort = (arr: number[], low: number, high: number) => {
      if (low < high) {
        const pi = partition(arr, low, high)
        sortedIndices.push(pi)
        quickSort(arr, low, pi - 1)
        quickSort(arr, pi + 1, high)
      }
    }

    const arrayCopy = [...arr]
    quickSort(arrayCopy, 0, arrayCopy.length - 1)
    return steps
  }, [])

  const generateMergeSortSteps = useCallback((arr: number[]): SortingStep[] => {
    const steps: SortingStep[] = []
    const sortedIndices: number[] = []

    const merge = (arr: number[], left: number, mid: number, right: number) => {
      const leftArray = arr.slice(left, mid + 1)
      const rightArray = arr.slice(mid + 1, right + 1)
      let i = 0,
        j = 0,
        k = left

      while (i < leftArray.length && j < rightArray.length) {
        steps.push({
          array: [...arr],
          comparedIndices: [left + i, mid + 1 + j],
          swappedIndices: [],
          sortedIndices: [...sortedIndices],
          message: `Comparing ${leftArray[i]} with ${rightArray[j]}`
        })

        if (leftArray[i] <= rightArray[j]) {
          arr[k] = leftArray[i]
          i++
        } else {
          arr[k] = rightArray[j]
          j++
        }
        k++
      }

      while (i < leftArray.length) {
        arr[k] = leftArray[i]
        i++
        k++
      }

      while (j < rightArray.length) {
        arr[k] = rightArray[j]
        j++
        k++
      }

      for (let idx = left; idx <= right; idx++) {
        sortedIndices.push(idx)
      }

      steps.push({
        array: [...arr],
        comparedIndices: [],
        swappedIndices: [],
        sortedIndices: [...sortedIndices],
        message: `Merged subarray from index ${left} to ${right}`
      })
    }

    const mergeSort = (arr: number[], left: number, right: number) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2)
        mergeSort(arr, left, mid)
        mergeSort(arr, mid + 1, right)
        merge(arr, left, mid, right)
      }
    }

    const arrayCopy = [...arr]
    mergeSort(arrayCopy, 0, arrayCopy.length - 1)
    return steps
  }, [])

  useEffect(() => {
    let steps: SortingStep[] = []
    switch (selectedAlgorithm) {
      case 'quickSort':
        steps = generateQuickSortSteps(array)
        break
      case 'mergeSort':
        steps = generateMergeSortSteps(array)
        break
      default:
        steps = generateQuickSortSteps(array)
    }
    setSortingSteps(steps)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [array, selectedAlgorithm, generateQuickSortSteps, generateMergeSortSteps])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying && currentStep < sortingSteps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, speed)
    } else if (currentStep >= sortingSteps.length - 1) {
      setIsPlaying(false)
    }
    return () => clearTimeout(timer)
  }, [isPlaying, currentStep, sortingSteps.length, speed])

  const getBarColor = (index: number) => {
    const step = sortingSteps[currentStep]
    if (!step) return 'bg-gray-400'

    if (step.swappedIndices.includes(index)) return 'bg-red-500'
    if (step.comparedIndices.includes(index)) return 'bg-blue-500'
    if (step.sortedIndices.includes(index)) return 'bg-green-500'
    return 'bg-gray-400'
  }

  return (
    <div className='p-6 max-w-6xl mx-auto border rounded-lg shadow-md bg-white'>
      <div className='space-y-6'>
        <h2 className='text-2xl font-bold text-center'>Sorting Algorithm Visualization</h2>

        <div className='flex flex-wrap gap-4 justify-center'>
          <div className='flex gap-2 items-center'>
            <input
              type='text'
              value={inputValue}
              onChange={handleInputChange}
              placeholder='Enter numbers separated by commas'
              className='border p-2 rounded w-64'
            />
            <button
              onClick={handleArraySubmit}
              className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
            >
              Update Array
            </button>
            <button
              onClick={() => generateRandomArray()}
              className='px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600'
            >
              Random Array
            </button>
          </div>

          <div className='flex gap-2 items-center'>
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              className='border p-2 rounded'
            >
              <option value='quickSort'>Quick Sort</option>
              <option value='mergeSort'>Merge Sort</option>
            </select>

            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className='border p-2 rounded'>
              <option value='2000'>Slow</option>
              <option value='1000'>Normal</option>
              <option value='500'>Fast</option>
            </select>
          </div>
        </div>

        <div className='flex justify-center gap-4'>
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(sortingSteps.length - 1, currentStep + 1))}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
            disabled={currentStep === sortingSteps.length - 1}
          >
            Next
          </button>
          <button
            onClick={() => {
              setCurrentStep(0)
              setIsPlaying(false)
            }}
            className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
          >
            Reset
          </button>
        </div>

        <div className='flex flex-col items-center space-y-4'>
          <div className='h-64 relative w-full flex items-end justify-center gap-1'>
            {sortingSteps[currentStep]?.array.map((value, index) => (
              <div
                key={index}
                className={`w-8 transition-all duration-300 ${getBarColor(index)}`}
                style={{
                  height: `${(value / Math.max(...array)) * 100}%`
                }}
              >
                <span className='text-xs'>{value}</span>
              </div>
            ))}
          </div>

          <div className='text-center text-gray-600'>{sortingSteps[currentStep]?.message || 'Ready to sort'}</div>

          <div className='text-center text-sm text-gray-500'>
            Step {currentStep + 1} / {sortingSteps.length}
          </div>
        </div>

        <div className='flex justify-center gap-4 text-sm'>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-blue-500'></div>
            <span>Comparing</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-red-500'></div>
            <span>Swapping</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-green-500'></div>
            <span>Sorted</span>
          </div>
        </div>

        <div className='text-center text-sm text-gray-500'>
          <p>
            Created by:{' '}
            <a href='https://github.com/hahuyhungdev' className='text-blue-500 hover:underline'>
              @hahuyhungdev
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SortingVisualization
