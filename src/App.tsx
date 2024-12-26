import { useEffect, useState } from 'react'

interface SortingStep {
  array: number[]
  pivot: number | null
  leftPointer: number | null
  rightPointer: number | null
  message: string
}

const SortingVisualization = () => {
  const [array, setArray] = useState<number[]>([7, 8, 10, 1, 5, 20, 3, 2, 6, 4, 9])
  const [inputValue, setInputValue] = useState<string>('')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('selectionSort')
  const [pivot, setPivot] = useState<number | null>(null)
  const [leftPointer, setLeftPointer] = useState<number | null>(null)
  const [rightPointer, setRightPointer] = useState<number | null>(null)
  const [sortingSteps, setSortingSteps] = useState<SortingStep[]>([])
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
  }

  const handleArraySubmit = () => {
    try {
      const newArray = inputValue.split(',').map((num) => Number(num.trim()))
      if (newArray.some(isNaN)) {
        alert('Vui lòng nhập các số cách nhau bằng dấu phẩy')
        return
      }
      setArray(newArray)
      setCurrentStep(0)
      setIsPlaying(false)
    } catch (error) {
      alert('Định dạng không hợp lệ. Vui lòng nhập các số cách nhau bằng dấu phẩy')
    }
  }

  const generateQuickSortSteps = (arr: number[]): SortingStep[] => {
    const steps: SortingStep[] = []
    const recordStep = (array: number[], pivot: number, left: number, right: number, message: string) => {
      steps.push({
        array: [...array],
        pivot,
        leftPointer: left,
        rightPointer: right,
        message
      })
    }

    const partition = (arr: number[], low: number, high: number): number => {
      const pivot = arr[low]
      let i = low
      let j = high

      recordStep([...arr], low, i, j, `Chọn pivot = ${pivot}`)

      while (i < j) {
        while (i <= high && arr[i] <= pivot) {
          i++
          recordStep([...arr], low, i, j, `Tìm phần tử > ${pivot} từ trái qua`)
        }
        while (arr[j] > pivot) {
          j--
          recordStep([...arr], low, i, j, `Tìm phần tử <= ${pivot} từ phải qua`)
        }
        if (i < j) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          recordStep([...arr], low, i, j, `Đổi chỗ ${arr[j]} và ${arr[i]}`)
        }
      }

      ;[arr[low], arr[j]] = [arr[j], arr[low]]
      recordStep([...arr], j, i, j, `Đặt pivot vào vị trí cuối cùng`)
      return j
    }

    const quickSort = (arr: number[], low: number, high: number): number[] => {
      if (low < high) {
        const pivotIndex = partition(arr, low, high)
        quickSort(arr, low, pivotIndex - 1)
        quickSort(arr, pivotIndex + 1, high)
      }
      return arr
    }

    const arrayCopy = [...arr]
    quickSort(arrayCopy, 0, arrayCopy.length - 1)
    return steps
  }

  const generateSelectionSortSteps = (arr: number[]): SortingStep[] => {
    const steps: SortingStep[] = []
    const arrayCopy = [...arr]
    const n = arrayCopy.length

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i
      steps.push({
        array: [...arrayCopy],
        pivot: i,
        leftPointer: minIndex,
        rightPointer: null,
        message: `Tìm phần tử nhỏ nhất từ vị trí ${i}`
      })

      for (let j = i + 1; j < n; j++) {
        if (arrayCopy[j] < arrayCopy[minIndex]) {
          minIndex = j
        }
        steps.push({
          array: [...arrayCopy],
          pivot: i,
          leftPointer: minIndex,
          rightPointer: j,
          message: `So sánh ${arrayCopy[j]} với ${arrayCopy[minIndex]}`
        })
      }

      if (minIndex !== i) {
        ;[arrayCopy[i], arrayCopy[minIndex]] = [arrayCopy[minIndex], arrayCopy[i]]
        steps.push({
          array: [...arrayCopy],
          pivot: i,
          leftPointer: null,
          rightPointer: null,
          message: `Đổi chỗ ${arrayCopy[i]} với ${arrayCopy[minIndex]}`
        })
      }
    }

    return steps
  }

  const generateInsertionSortSteps = (arr: number[]): SortingStep[] => {
    const steps: SortingStep[] = []
    const arrayCopy = [...arr]
    const n = arrayCopy.length

    for (let i = 1; i < n; i++) {
      const key = arrayCopy[i]
      let j = i - 1

      steps.push({
        array: [...arrayCopy],
        pivot: i,
        leftPointer: null,
        rightPointer: null,
        message: `Chọn phần tử ${key} để chèn`
      })

      while (j >= 0 && arrayCopy[j] > key) {
        arrayCopy[j + 1] = arrayCopy[j]
        j--

        steps.push({
          array: [...arrayCopy],
          pivot: i,
          leftPointer: j + 1,
          rightPointer: null,
          message: `Di chuyển ${arrayCopy[j + 1]} sang phải`
        })
      }

      arrayCopy[j + 1] = key
      steps.push({
        array: [...arrayCopy],
        pivot: j + 1,
        leftPointer: null,
        rightPointer: null,
        message: `Chèn ${key} vào vị trí ${j + 1}`
      })
    }

    return steps
  }

  useEffect(() => {
    let steps: SortingStep[] = []
    switch (selectedAlgorithm) {
      case 'quickSort':
        steps = generateQuickSortSteps(array)
        break
      case 'selectionSort':
        steps = generateSelectionSortSteps(array)
        break
      case 'insertionSort':
        steps = generateInsertionSortSteps(array)
        break
      default:
        steps = generateQuickSortSteps(array)
    }
    setSortingSteps(steps)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [array, selectedAlgorithm])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying && currentStep < sortingSteps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, 1000)
    } else {
      setIsPlaying(false)
    }
    return () => clearTimeout(timer)
  }, [isPlaying, currentStep, sortingSteps.length])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const handleStep = (forward: boolean) => {
    if (forward && currentStep < sortingSteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else if (!forward && currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <div className='p-6 max-w-4xl mx-auto border rounded-lg shadow-md bg-white'>
      <div className='space-y-6'>
        <h2 className='text-2xl font-bold text-center'>Sorting Algorithm Visualization</h2>
        <div className='flex gap-4 justify-center'>
          <input
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            placeholder='Nhập các số, cách nhau bằng dấu phẩy'
            className='border p-2 rounded flex-1 max-w-md'
          />
          <button onClick={handleArraySubmit} className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'>
            Cập nhật mảng
          </button>
        </div>
        <div className='flex gap-4 justify-center'>
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            className='border p-2 rounded'
          >
            <option value='quickSort'>Quick Sort</option>
            <option value='bubbleSort'>Bubble Sort</option>
            <option value='selectionSort'>Selection Sort</option>
            <option value='insertionSort'>Insertion Sort</option>
            <option value='mergeSort'>Merge Sort</option>
            <option value='heapSort'>Heap Sort</option>
          </select>
        </div>
        <div className='flex justify-center gap-4'>
          <button
            onClick={() => handleStep(false)}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            disabled={currentStep === 0}
          >
            Trước
          </button>
          <button onClick={handlePlayPause} className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
            {isPlaying ? 'Tạm dừng' : 'Chạy'}
          </button>
          <button
            onClick={() => handleStep(true)}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            disabled={currentStep === sortingSteps.length - 1}
          >
            Sau
          </button>
          <button onClick={handleReset} className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'>
            Reset
          </button>
        </div>
        <div className='flex flex-col items-center space-y-4'>
          <div className='h-64 relative w-full flex items-end justify-center gap-1'>
            {sortingSteps[currentStep]?.array.map((value, index) => (
              <div
                key={index}
                className={`w-8 transition-all duration-300 ${
                  index === sortingSteps[currentStep]?.pivot
                    ? 'bg-red-500'
                    : index === sortingSteps[currentStep]?.leftPointer
                    ? 'bg-blue-500'
                    : index === sortingSteps[currentStep]?.rightPointer
                    ? 'bg-green-500'
                    : 'bg-gray-400'
                }`}
                style={{
                  height: `${(value / Math.max(...array)) * 100}%`
                }}
              >
                <span className='text-xs'>{value}</span>
              </div>
            ))}
          </div>
          <div className='text-center text-gray-600'>{sortingSteps[currentStep]?.message || 'Bắt đầu sắp xếp'}</div>
          <div className='text-center text-sm text-gray-500'>
            Bước {currentStep + 1} / {sortingSteps.length}
          </div>
        </div>

        <div className='text-center text-sm text-gray-500'>
          <p>
            author:{' '}
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
