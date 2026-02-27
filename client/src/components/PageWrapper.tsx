import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export const PageWrapper = ({ children }: { children: ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="h-full w-full"
    >
        {children}
    </motion.div>
)
