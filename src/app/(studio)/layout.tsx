import { StudioLayout } from '@/modules/studio/ui/layout'
import React, { PropsWithChildren } from 'react'

const StudioLayoutHome = ({ children }: PropsWithChildren) => {
    return (
        <StudioLayout>
            {children}
      </StudioLayout>
  )
}

export default StudioLayoutHome