import { useState } from 'react'

interface Step {
  array: number[]
  pivot: number | null
  left: number | null
  right: number | null
  workingRange: { start: number | null; end: number | null }
  message: string
  sortedIndex?: number
}

export default function QuickSortVisualization({ data }: { data: number[] }) {
  const [array, setArray] = useState<number[]>(data)
  const [pivotIndex, setPivotIndex] = useState<number | null>(null)
  const [leftPointer, setLeftPointer] = useState<number | null>(null)
  const [rightPointer, setRightPointer] = useState<number | null>(null)
  const [sorted, setSorted] = useState<number[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [workingRange, setWorkingRange] = useState<{ start: number | null; end: number | null }>({
    start: null,
    end: null
  })

  const generateSteps = (arr: number[], low: number, high: number): Step[] => {
    const steps: Step[] = []

    const partition = (arr: number[], low: number, high: number): number => {
      const pivotIdx = Math.floor(low + (high - low) / 2)
      const pivotValue = arr[pivotIdx]
      steps.push({
        array: [...arr],
        pivot: pivotIdx,
        left: low,
        right: high,
        workingRange: { start: low, end: high },
        message: `Chọn pivot=${pivotValue} tại index ${pivotIdx} (giữa đoạn từ ${low} đến ${high})`
      })
      ;[arr[low], arr[pivotIdx]] = [arr[pivotIdx], arr[low]]
      steps.push({
        array: [...arr],
        pivot: low,
        left: low + 1,
        right: high,
        workingRange: { start: low, end: high },
        message: `Đưa pivot về đầu mảng (index ${low})`
      })

      let i = low + 1
      let j = high

      while (i <= j) {
        while (i <= high && arr[i] < pivotValue) {
          steps.push({
            array: [...arr],
            pivot: low,
            left: i,
            right: j,
            workingRange: { start: low, end: high },
            message: `Tìm từ trái: arr[${i}]=${arr[i]} < pivot=${pivotValue}`
          })
          i++
        }
        if (i <= high) {
          steps.push({
            array: [...arr],
            pivot: low,
            left: i,
            right: j,
            workingRange: { start: low, end: high },
            message: `Dừng tìm trái tại arr[${i}]=${arr[i]} >= pivot=${pivotValue}`
          })
        }

        while (j >= low + 1 && arr[j] >= pivotValue) {
          steps.push({
            array: [...arr],
            pivot: low,
            left: i,
            right: j,
            workingRange: { start: low, end: high },
            message: `Tìm từ phải: arr[${j}]=${arr[j]} >= pivot=${pivotValue}`
          })
          j--
        }
        if (j >= low + 1) {
          steps.push({
            array: [...arr],
            pivot: low,
            left: i,
            right: j,
            workingRange: { start: low, end: high },
            message: `Dừng tìm phải tại arr[${j}]=${arr[j]} < pivot=${pivotValue}`
          })
        }

        if (i < j) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          steps.push({
            array: [...arr],
            pivot: low,
            left: i,
            right: j,
            workingRange: { start: low, end: high },
            message: `Swap arr[${i}]=${arr[j]} với arr[${j}]=${arr[i]}`
          })
        }
      }

      ;[arr[low], arr[j]] = [arr[j], arr[low]]
      steps.push({
        array: [...arr],
        pivot: j,
        left: i,
        right: j,
        workingRange: { start: low, end: high },
        message: `Đặt pivot vào vị trí cuối cùng ${j}`,
        sortedIndex: j
      })

      return j
    }

    const quickSort = (arr: number[], low: number, high: number) => {
      if (low < high) {
        const pivotIndex = partition(arr, low, high)
        quickSort(arr, low, pivotIndex - 1)
        quickSort(arr, pivotIndex + 1, high)
      }
      return arr
    }

    quickSort([...arr], low, high)
    return steps
  }

  const initializeSort = () => {
    const newSteps = generateSteps([...array], 0, array.length - 1)
    setSteps(newSteps)
    setCurrentStep(-1)
    setSorted([])
    setPivotIndex(null)
    setLeftPointer(null)
    setRightPointer(null)
    setWorkingRange({ start: null, end: null })
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = steps[currentStep + 1]
      setArray(nextStep.array)
      setPivotIndex(nextStep.pivot)
      setLeftPointer(nextStep.left)
      setRightPointer(nextStep.right)
      setWorkingRange(nextStep.workingRange)
      if (nextStep.sortedIndex !== undefined) {
        setSorted((prev) => [...prev, nextStep.sortedIndex] as number[])
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStep = steps[currentStep - 1]
      setArray(prevStep.array)
      setPivotIndex(prevStep.pivot)
      setLeftPointer(prevStep.left)
      setRightPointer(prevStep.right)
      setWorkingRange(prevStep.workingRange)
      if (steps[currentStep].sortedIndex !== undefined) {
        setSorted((prev) => prev.filter((x) => x !== steps[currentStep].sortedIndex))
      }
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className='p-4 max-w-4xl mx-auto'>
      <div className='mb-4 space-x-2'>
        <button
          onClick={() => setArray([6, 5, 8, 9, 3, 10, 15, 12, 16])}
          className='bg-blue-500 text-white px-4 py-2 rounded'
        >
          Reset Mảng
        </button>
        <button onClick={initializeSort} className='bg-green-500 text-white px-4 py-2 rounded'>
          Bắt đầu Sort
        </button>
      </div>

      <div className='mb-4 space-x-2'>
        <button
          onClick={prevStep}
          disabled={currentStep <= 0}
          className='bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50'
        >
          Bước Trước
        </button>
        <button
          onClick={nextStep}
          disabled={currentStep >= steps.length - 1}
          className='bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50'
        >
          Bước Tiếp
        </button>
      </div>

      <div className='flex flex-wrap gap-2 mb-4'>
        {array.map((value, index) => (
          <div
            key={index}
            className={`
              w-14 h-14 flex flex-col items-center justify-center
              border-2 rounded relative
              ${
                index >= (workingRange.start ?? -1) && index <= (workingRange.end ?? -1)
                  ? 'border-gray-400'
                  : 'border-gray-200'
              }
              ${pivotIndex === index ? 'bg-yellow-300' : ''}
              ${leftPointer === index ? 'bg-blue-200' : ''}
              ${rightPointer === index ? 'bg-red-200' : ''}
              ${sorted.includes(index) ? 'bg-green-200' : ''}
            `}
          >
            <div className='text-sm'>i:{index}</div>
            <div className='font-bold'>{value}</div>
          </div>
        ))}
      </div>

      <div className='mt-4'>
        <h3 className='font-bold mb-2'>Trạng thái hiện tại:</h3>
        <div className='space-y-1 text-sm'>
          <div>
            Đang xét đoạn: [{workingRange.start ?? '?'} → {workingRange.end ?? '?'}]
          </div>
          <div>
            Pivot index: {pivotIndex ?? '?'} (giá trị: {pivotIndex !== null ? array[pivotIndex] : '?'})
          </div>
          <div>Left pointer (i): {leftPointer ?? '?'}</div>
          <div>Right pointer (j): {rightPointer ?? '?'}</div>
          <div className='mt-2 font-medium'>
            {currentStep >= 0 && steps[currentStep] ? steps[currentStep].message : 'Chưa bắt đầu'}
          </div>
        </div>
      </div>

      <div className='mt-4 text-sm text-gray-600'>
        <p>Màu sắc:</p>
        <ul className='list-disc list-inside'>
          <li>Vàng: pivot</li>
          <li>Xanh dương: con trỏ trái (i)</li>
          <li>Đỏ: con trỏ phải (j)</li>
          <li>Xanh lá: đã sắp xếp đúng vị trí</li>
        </ul>
      </div>
    </div>
  )
}
