'use client'

import { useState, useRef, useEffect } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
}

export default function VoiceRecorder({
  onTranscription,
  isRecording,
  setIsRecording
}: VoiceRecorderProps) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition()

  const [audioLevel, setAudioLevel] = useState(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (transcript && listening) {
      onTranscription(transcript)
    }
  }, [transcript, listening, onTranscription])

  const startRecording = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('Browser does not support speech recognition.')
      return
    }

    resetTranscript()
    SpeechRecognition.startListening()
    setIsRecording(true)
  }

  const stopRecording = () => {
    SpeechRecognition.stopListening()
    setIsRecording(false)
    if (transcript) {
      onTranscription(transcript)
    }
  }

  const analyzeAudio = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    setAudioLevel(average / 255)

    animationRef.current = requestAnimationFrame(analyzeAudio)
  }

  useEffect(() => {
    if (listening) {
      animationRef.current = requestAnimationFrame(analyzeAudio)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      setAudioLevel(0)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [listening])

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 dark:text-slate-400">
          Voice recording is not supported in this browser.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
              : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30'
          }`}
        >
          {isRecording ? (
            <div className="w-6 h-6 bg-white rounded-sm"></div>
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          )}
        </button>

        {isRecording && (
          <div className="flex items-end space-x-1 h-12">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-primary rounded-full transition-all duration-200"
                style={{
                  height: `${Math.max(8, audioLevel * 40 * (0.5 + Math.sin(Date.now() * 0.01 + i) * 0.5))}px`
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isRecording ? 'Listening... Speak naturally' : 'Tap to start voice recording'}
        </p>
        {transcript && (
          <p className="mt-2 text-sm text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
            "{transcript}"
          </p>
        )}
      </div>
    </div>
  )
}
