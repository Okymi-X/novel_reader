import { motion } from "framer-motion";

export function AudioWaveform({ isPlaying }: { isPlaying: boolean }) {
    return (
        <div className="flex items-end gap-[3px] h-4 mx-2">
            {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-gradient-to-t from-primary to-primary/60"
                    animate={isPlaying ? {
                        height: ['4px', `${8 + ((i * 7) % 10)}px`, '4px'],
                    } : { height: '4px' }}
                    transition={isPlaying ? {
                        repeat: Infinity,
                        duration: 0.4 + i * 0.12,
                        ease: 'easeInOut',
                        delay: i * 0.08,
                    } : { duration: 0.3 }}
                />
            ))}
        </div>
    );
}
