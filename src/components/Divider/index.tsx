import classNames from 'classnames'
import { FC } from 'react'

interface Props {
  direction?: 'horizontal' | 'vertical'
  className?: string
}

const Divider: FC<Props> = ({ direction = 'horizontal', className }) => (
  <div
    className={classNames(
      ' bg-black bg-opacity-5',
      {
        'h-px w-full': direction === 'horizontal',
        'h-screen w-px': direction === 'vertical'
      },
      className
    )}
  />
)

export default Divider