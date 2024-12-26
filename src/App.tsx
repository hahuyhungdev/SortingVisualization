import QuickSortVisualization from '@/components/QuickSort'
import { useCallback, useEffect, useState } from 'react'

interface SortingStep {
  array: number[]
  comparedIndices: number[]
  swappedIndices: number[]
  sortedIndices: number[]
  message: string
}

const SortingVisualization = () => {
  const [array, setArray] = useState<number[]>([6, 5, 8, 9, 3, 10, 15, 12, 16])
  const [inputValue, setInputValue] = useState<string>('')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('quickSort')
  const [sortingSteps, setSortingSteps] = useState<SortingStep[]>([])
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(1000) // milliseconds per step
  const [arrayLength, setArrayLength] = useState<string>('')
  const [activeQuickSort, setActiveQuickSort] = useState<boolean>(false)

  const generateRandomArray = (length: number) => {
    const randomRange = Math.floor(Math.random() * 50) + 1
    const newArray = Array.from(
      {
        length: length || 10
      },
      () => Math.floor(Math.random() * randomRange) + 1
    )
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

  // // Sorting Algorithm Implementations

  const generateQuickSortSteps = useCallback((arr: number[]): SortingStep[] => {
    const steps: SortingStep[] = []
    const finalPositionIndices: number[] = []

    const swap = (arr: number[], firstIndex: number, secondIndex: number) => {
      ;[arr[firstIndex], arr[secondIndex]] = [arr[secondIndex], arr[firstIndex]]
      steps.push({
        array: [...arr],
        comparedIndices: [],
        swappedIndices: [firstIndex, secondIndex],
        sortedIndices: [...finalPositionIndices],
        message: `Hoán đổi phần tử ${arr[firstIndex]} (index ${firstIndex}) với ${arr[secondIndex]} (index ${secondIndex})`
      })
    }

    const partition = (arr: number[], low: number, high: number): number => {
      const pivotIndex = Math.floor(low + (high - low) / 2)
      const pivotValue = arr[pivotIndex]
      swap(arr, low, pivotIndex)

      let left = low + 1
      let right = high

      steps.push({
        array: [...arr],
        comparedIndices: [pivotIndex],
        swappedIndices: [],
        sortedIndices: [...finalPositionIndices],
        message: `Chọn pivot là ${pivotValue} tại vị trí ${pivotIndex}`
      })

      while (left < right) {
        while (left <= high && arr[left] < pivotValue) left++
        while (right >= low + 1 && arr[right] >= pivotValue) right--

        if (left < right) swap(arr, left, right)
      }

      swap(arr, low, right)

      finalPositionIndices.push(right)
      steps.push({
        array: [...arr],
        comparedIndices: [],
        swappedIndices: [],
        sortedIndices: [...finalPositionIndices],
        message: `Hoàn thành phân vùng: Các phần tử bên trái ${pivotValue} nhỏ hơn pivot, bên phải lớn hơn pivot`
      })

      return right
    }

    const quickSort = (arr: number[], start: number, end: number) => {
      if (start < end) {
        const partitionPoint = partition(arr, start, end)

        steps.push({
          array: [...arr],
          comparedIndices: [],
          swappedIndices: [],
          sortedIndices: [...finalPositionIndices],
          message: `Chia mảng thành 2 phần: [${arr.slice(start, partitionPoint)}] và [${arr.slice(partitionPoint + 1)}]`
        })

        quickSort(arr, start, partitionPoint - 1)
        quickSort(arr, partitionPoint + 1, end)
      }
    }

    const arrayToSort = [...arr]
    quickSort(arrayToSort, 0, arrayToSort.length - 1)

    steps.push({
      array: arrayToSort,
      comparedIndices: [],
      swappedIndices: [],
      sortedIndices: [...Array(arrayToSort.length).keys()],
      message: `Hoàn thành sắp xếp: [${arrayToSort.join(', ')}]`
    })

    return steps
  }, [])

  const generateMergeSortSteps = useCallback((arr: number[]): SortingStep[] => {
    const steps: SortingStep[] = []
    const sortedIndices: number[] = []

    const merge = (arr: number[], left: number, mid: number, hight: number) => {
      const leftArray = arr.slice(left, mid + 1)
      const hightArray = arr.slice(mid + 1, hight + 1)
      let i = 0,
        j = 0,
        k = left

      while (i < leftArray.length && j < hightArray.length) {
        steps.push({
          array: [...arr],
          comparedIndices: [left + i, mid + 1 + j],
          swappedIndices: [],
          sortedIndices: [...sortedIndices],
          message: `Comparing ${leftArray[i]} with ${hightArray[j]}`
        })

        if (leftArray[i] <= hightArray[j]) {
          arr[k] = leftArray[i]
          i++
        } else {
          arr[k] = hightArray[j]
          j++
        }
        k++
      }

      while (i < leftArray.length) {
        arr[k] = leftArray[i]
        i++
        k++
      }

      while (j < hightArray.length) {
        arr[k] = hightArray[j]
        j++
        k++
      }

      for (let idx = left; idx <= hight; idx++) {
        sortedIndices.push(idx)
      }

      steps.push({
        array: [...arr],
        comparedIndices: [],
        swappedIndices: [],
        sortedIndices: [...sortedIndices],
        message: `Merged subarray from index ${left} to ${hight}`
      })
    }

    const mergeSort = (arr: number[], left: number, hight: number) => {
      if (left < hight) {
        const mid = Math.floor((left + hight) / 2)
        mergeSort(arr, left, mid)
        mergeSort(arr, mid + 1, hight)
        merge(arr, left, mid, hight)
      }
    }

    const arrayCopy = [...arr]
    mergeSort(arrayCopy, 0, arrayCopy.length - 1)
    return steps
  }, [])

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
  const generateBubbleSortSteps = useCallback((arr: number[]): SortingStep[] => {
    const steps: SortingStep[] = []
    const arrayCopy = [...arr]
    const n = arrayCopy.length
    const sortedIndices: number[] = []

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          array: [...arrayCopy],
          comparedIndices: [j, j + 1],
          swappedIndices: [],
          sortedIndices: [...sortedIndices],
          message: `Comparing ${arrayCopy[j]} with ${arrayCopy[j + 1]}`
        })

        if (arrayCopy[j] > arrayCopy[j + 1]) {
          ;[arrayCopy[j], arrayCopy[j + 1]] = [arrayCopy[j + 1], arrayCopy[j]]
          steps.push({
            array: [...arrayCopy],
            comparedIndices: [],
            swappedIndices: [j, j + 1],
            sortedIndices: [...sortedIndices],
            message: `Swapping ${arrayCopy[j + 1]} and ${arrayCopy[j]}`
          })
        }
      }
      sortedIndices.push(n - i - 1)
    }
    sortedIndices.push(0)
    steps.push({
      array: [...arrayCopy],
      comparedIndices: [],
      swappedIndices: [],
      sortedIndices,
      message: 'Sorting completed!'
    })

    return steps
  }, [])
  const generateSelectionSortSteps = useCallback((arr: number[]): SortingStep[] => {
    const steps: SortingStep[] = []
    const arrayCopy = [...arr]
    const n = arrayCopy.length
    const sortedIndices: number[] = []

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i

      for (let j = i + 1; j < n; j++) {
        steps.push({
          array: [...arrayCopy],
          comparedIndices: [minIdx, j],
          swappedIndices: [],
          sortedIndices: [...sortedIndices],
          message: `Finding minimum element: comparing ${arrayCopy[j]} with current minimum ${arrayCopy[minIdx]}`
        })

        if (arrayCopy[j] < arrayCopy[minIdx]) {
          minIdx = j
        }
      }

      if (minIdx !== i) {
        ;[arrayCopy[i], arrayCopy[minIdx]] = [arrayCopy[minIdx], arrayCopy[i]]
        steps.push({
          array: [...arrayCopy],
          comparedIndices: [],
          swappedIndices: [i, minIdx],
          sortedIndices: [...sortedIndices],
          message: `Swapping ${arrayCopy[i]} with ${arrayCopy[minIdx]}`
        })
      }

      sortedIndices.push(i)
    }
    sortedIndices.push(n - 1)
    steps.push({
      array: [...arrayCopy],
      comparedIndices: [],
      swappedIndices: [],
      sortedIndices,
      message: 'Sorting completed!'
    })

    return steps
  }, [])
  // Insertion Sort Implementation
  const generateInsertionSortSteps = useCallback((arr: number[]): SortingStep[] => {
    const steps: SortingStep[] = []
    const arrayCopy = [...arr]
    const n = arrayCopy.length
    const sortedIndices: number[] = [0]

    for (let i = 1; i < n; i++) {
      const key = arrayCopy[i]
      let j = i - 1

      steps.push({
        array: [...arrayCopy],
        comparedIndices: [i],
        swappedIndices: [],
        sortedIndices: [...sortedIndices],
        message: `Current element to insert: ${key}`
      })

      while (j >= 0 && arrayCopy[j] > key) {
        steps.push({
          array: [...arrayCopy],
          comparedIndices: [j, j + 1],
          swappedIndices: [],
          sortedIndices: [...sortedIndices],
          message: `Comparing ${arrayCopy[j]} with ${key}`
        })

        arrayCopy[j + 1] = arrayCopy[j]
        steps.push({
          array: [...arrayCopy],
          comparedIndices: [],
          swappedIndices: [j, j + 1],
          sortedIndices: [...sortedIndices],
          message: `Moving ${arrayCopy[j]} to the hight`
        })
        j--
      }

      arrayCopy[j + 1] = key
      sortedIndices.push(i)
      steps.push({
        array: [...arrayCopy],
        comparedIndices: [],
        swappedIndices: [],
        sortedIndices: [...sortedIndices],
        message: `Inserted ${key} into position ${j + 1}`
      })
    }

    return steps
  }, [])
  // Heap Sort Implementation
  const generateHeapSortSteps = useCallback((arr: number[]): SortingStep[] => {
    const steps: SortingStep[] = []
    const arrayCopy = [...arr]
    const sortedIndices: number[] = []

    const heapify = (n: number, i: number) => {
      let largest = i
      const left = 2 * i + 1
      const hight = 2 * i + 2

      if (left < n) {
        steps.push({
          array: [...arrayCopy],
          comparedIndices: [largest, left],
          swappedIndices: [],
          sortedIndices: [...sortedIndices],
          message: `Comparing ${arrayCopy[largest]} with left child ${arrayCopy[left]}`
        })

        if (arrayCopy[left] > arrayCopy[largest]) {
          largest = left
        }
      }

      if (hight < n) {
        steps.push({
          array: [...arrayCopy],
          comparedIndices: [largest, hight],
          swappedIndices: [],
          sortedIndices: [...sortedIndices],
          message: `Comparing ${arrayCopy[largest]} with hight child ${arrayCopy[hight]}`
        })

        if (arrayCopy[hight] > arrayCopy[largest]) {
          largest = hight
        }
      }

      if (largest !== i) {
        ;[arrayCopy[i], arrayCopy[largest]] = [arrayCopy[largest], arrayCopy[i]]
        steps.push({
          array: [...arrayCopy],
          comparedIndices: [],
          swappedIndices: [i, largest],
          sortedIndices: [...sortedIndices],
          message: `Swapping ${arrayCopy[i]} with ${arrayCopy[largest]}`
        })

        heapify(n, largest)
      }
    }

    // Build max heap
    for (let i = Math.floor(arrayCopy.length / 2) - 1; i >= 0; i--) {
      heapify(arrayCopy.length, i)
    }

    // Extract elements from heap one by one
    for (let i = arrayCopy.length - 1; i > 0; i--) {
      steps.push({
        array: [...arrayCopy],
        comparedIndices: [0, i],
        swappedIndices: [],
        sortedIndices: [...sortedIndices],
        message: `Moving largest element ${arrayCopy[0]} to end`
      })
      ;[arrayCopy[0], arrayCopy[i]] = [arrayCopy[i], arrayCopy[0]]
      sortedIndices.unshift(i)

      steps.push({
        array: [...arrayCopy],
        comparedIndices: [],
        swappedIndices: [0, i],
        sortedIndices: [...sortedIndices],
        message: `Heapifying remaining elements`
      })

      heapify(i, 0)
    }
    sortedIndices.unshift(0)

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
      case 'bubbleSort':
        steps = generateBubbleSortSteps(array)
        break
      case 'selectionSort':
        steps = generateSelectionSortSteps(array)
        break
      case 'insertionSort':
        steps = generateInsertionSortSteps(array)
        break
      case 'heapSort':
        steps = generateHeapSortSteps(array)
        break
      default:
        steps = generateQuickSortSteps(array)
    }
    setSortingSteps(steps)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [
    array,
    selectedAlgorithm,
    generateQuickSortSteps,
    generateMergeSortSteps,
    generateBubbleSortSteps,
    generateSelectionSortSteps,
    generateInsertionSortSteps,
    generateHeapSortSteps
  ])
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
              onClick={() => generateRandomArray(Number(arrayLength))}
              className='px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600'
            >
              Random Array
            </button>
            <input
              type='text'
              accept='number'
              value={arrayLength}
              onBlur={() => {
                if (arrayLength === '') return
                setArrayLength(String(Number(arrayLength)))
              }}
              onChange={(e) => {
                const value = e.target.value

                const regex = /^[0-9\b]*$/

                if (regex.test(value)) {
                  setArrayLength(value)
                }
              }}
              className='border p-2 rounded w-16'
              placeholder='Array Length
            '
            />
          </div>

          <div className='flex gap-2 items-center'>
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              className='border p-2 rounded'
            >
              <option value='quickSort'>Quick Sort</option>
              <option value='mergeSort'>Merge Sort</option>
              <option value='bubbleSort'>Bubble Sort</option>
              <option value='selectionSort'>Selection Sort</option>
              <option value='insertionSort'>Insertion Sort</option>
              <option value='heapSort'>Heap Sort</option>
            </select>

            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className='border p-2 rounded'>
              <option value='500'>Fast</option>
              <option value='1000'>Normal</option>
              <option value='2000'>Slow</option>
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

        <div className='flex flex-col items-center'>
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

          <div className='flex gap-1'>
            {array.map((_, index) => (
              <div key={index} className='w-8'>
                {index}
              </div>
            ))}
          </div>

          <div className='mt-4 text-center text-gray-600'>{sortingSteps[currentStep]?.message || 'Ready to sort'}</div>

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
        <button
          className='bg-blue-500 text-white px-4 py-2 rounded'
          onClick={() => {
            setActiveQuickSort(!activeQuickSort)
          }}
        ></button>
        {activeQuickSort && <QuickSortVisualization data={array} />}
        <img src='/complexity.png' alt='time complexity of sorting algorithms' className='w-full' />
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
