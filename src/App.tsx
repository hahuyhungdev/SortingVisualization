import { useCallback, useEffect, useState } from 'react'

interface SortingStep {
  array: number[]
  comparedIndices: number[]
  swappedIndices: number[]
  sortedIndices: number[]
  message: string
}

const SortingVisualization = () => {
  const [array, setArray] = useState<number[]>([7, 8, 10, 1, 5, 11, 3, 12, 6, 4, 9])
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

  // // Sorting Algorithm Implementations

  const generateQuickSortSteps = useCallback((arr: number[]): SortingStep[] => {
    const steps: SortingStep[] = []
    const finalPositionIndices: number[] = [] // Đổi tên từ sortedIndices

    const swap = (arr: number[], firstIndex: number, secondIndex: number) => {
      ;[arr[firstIndex], arr[secondIndex]] = [arr[secondIndex], arr[firstIndex]]
      steps.push({
        array: [...arr],
        comparedIndices: [],
        swappedIndices: [firstIndex, secondIndex],
        sortedIndices: [...finalPositionIndices],
        message: `Hoán đổi phần tử ${arr[secondIndex]} (index${secondIndex}) với ${arr[firstIndex]} (index ${firstIndex})`
      })
    }

    const partition = (arr: number[], leftBound: number, rightBound: number): number => {
      const pivotIndex = Math.floor(leftBound + (rightBound - leftBound) / 2)
      const pivotValue = arr[pivotIndex]
      let leftPointer = leftBound
      let rightPointer = rightBound

      steps.push({
        array: [...arr],
        comparedIndices: [pivotIndex],
        swappedIndices: [],
        sortedIndices: [...finalPositionIndices],
        message: `Chọn chốt (pivot) là ${pivotValue} tại vị trí ${pivotIndex}`
      })

      while (leftPointer <= rightPointer) {
        while (arr[leftPointer] < pivotValue) {
          steps.push({
            array: [...arr],
            comparedIndices: [leftPointer, pivotIndex],
            swappedIndices: [],
            sortedIndices: [...finalPositionIndices],
            message: `So sánh: ${arr[leftPointer]} < ${pivotValue} (pivot) - Di chuyển con trỏ trái`
          })
          leftPointer++
        }

        while (arr[rightPointer] > pivotValue) {
          steps.push({
            array: [...arr],
            comparedIndices: [rightPointer, pivotIndex],
            swappedIndices: [],
            sortedIndices: [...finalPositionIndices],
            message: `So sánh: ${arr[rightPointer]} > ${pivotValue} (pivot) - Di chuyển con trỏ phải`
          })
          rightPointer--
        }

        if (leftPointer <= rightPointer) {
          if (leftPointer !== rightPointer) {
            swap(arr, leftPointer, rightPointer)
          }
          leftPointer++
          rightPointer--
        }
      }

      if (!finalPositionIndices.includes(pivotIndex)) {
        finalPositionIndices.push(pivotIndex)
      }

      steps.push({
        array: [...arr],
        comparedIndices: [],
        swappedIndices: [],
        sortedIndices: [...finalPositionIndices],
        message: `Hoàn thành phân vùng: Các phần tử bên trái ${pivotValue} nhỏ hơn ${pivotValue}, bên phải lớn hơn ${pivotValue}`
      })

      return leftPointer
    }

    const quickSort = (arr: number[], start: number, end: number) => {
      if (start < end) {
        const partitionPoint = partition(arr, start, end)

        steps.push({
          array: [...arr],
          comparedIndices: [],
          swappedIndices: [],
          sortedIndices: [...finalPositionIndices],
          message: `Chia mảng thành 2 phần: [${arr.slice(start, partitionPoint)}] và [${arr.slice(partitionPoint)}]`
        })

        // Sắp xếp phần bên trái
        quickSort(arr, start, partitionPoint - 1)

        // Sắp xếp phần bên phải
        quickSort(arr, partitionPoint, end)

        // Đánh dấu phần tử đã ở đúng vị trí
        if (!finalPositionIndices.includes(start)) {
          finalPositionIndices.push(start)
          steps.push({
            array: [...arr],
            comparedIndices: [],
            swappedIndices: [],
            sortedIndices: [...finalPositionIndices],
            message: `Phần tử ${arr[start]} đã ở đúng vị trí cuối cùng (vị trí ${start})`
          })
        }
      }
    }

    const arrayToSort = [...arr]
    quickSort(arrayToSort, 0, arrayToSort.length - 1)

    // Thêm bước cuối cùng
    steps.push({
      array: arrayToSort,
      comparedIndices: [],
      swappedIndices: [],
      sortedIndices: [...Array(arrayToSort.length).keys()], // Đánh dấu tất cả đã sắp xếp
      message: `Hoàn thành sắp xếp: [${arrayToSort.join(', ')}]`
    })

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
          message: `Moving ${arrayCopy[j]} to the right`
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
      const right = 2 * i + 2

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

      if (right < n) {
        steps.push({
          array: [...arrayCopy],
          comparedIndices: [largest, right],
          swappedIndices: [],
          sortedIndices: [...sortedIndices],
          message: `Comparing ${arrayCopy[largest]} with right child ${arrayCopy[right]}`
        })

        if (arrayCopy[right] > arrayCopy[largest]) {
          largest = right
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
