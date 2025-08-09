'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  MessageSquare,
  Download,
  Check,
  X,
  Bell,
  Smartphone,
  Lock,
  CreditCard,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

interface AccountabilityModalProps {
  isOpen: boolean
  onClose: () => void
  onSubscribe: () => void
  plan?: any
}

export default function AccountabilityModal({ 
  isOpen, 
  onClose, 
  onSubscribe,
  plan 
}: AccountabilityModalProps) {
  const [selectedFeatures, setSelectedFeatures] = useState({
    calendarSync: false,
    textNotifications: false
  })
  const [phoneNumber, setPhoneNumber] = useState('')
  
  const features = [
    {
      id: 'calendarSync',
      icon: Calendar,
      title: 'Calendar Sync',
      description: 'Automatically add all 90-day activities to your calendar',
      details: [
        'Works with Google Calendar, Outlook, and Apple Calendar',
        'Smart scheduling based on your availability',
        'Automatic reminders 15 minutes before each activity'
      ]
    },
    {
      id: 'textNotifications',
      icon: MessageSquare,
      title: 'SMS Reminders',
      description: 'Get text messages to keep you accountable',
      details: [
        'Daily motivation and activity reminders',
        'Weekly progress check-ins',
        'Customizable notification schedule'
      ]
    }
  ]
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Compact Header */}
            <div className="relative p-4 bg-gradient-to-r from-emerald-600 to-teal-600">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Lock className="w-5 h-5 text-white mr-2" />
                  <h2 className="text-xl font-display font-bold text-white">
                    Accountability Premium
                  </h2>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-white">$9</span>
                  <span className="text-sm text-white/60">/mo</span>
                </div>
              </div>
            </div>
            
            {/* Features Section */}
            <div className="p-4">
              <h3 className="text-sm font-display font-bold mb-3 text-gray-400 uppercase tracking-wider">
                Select Features
              </h3>
              
              <div className="space-y-2 mb-4">
                {features.map((feature) => {
                  const Icon = feature.icon
                  const isSelected = selectedFeatures[feature.id as keyof typeof selectedFeatures]
                  
                  return (
                    <motion.div
                      key={feature.id}
                      whileHover={{ scale: 1.01 }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                      onClick={() => setSelectedFeatures(prev => ({
                        ...prev,
                        [feature.id]: !prev[feature.id as keyof typeof selectedFeatures]
                      }))}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <Icon className={`w-5 h-5 mr-3 ${
                            isSelected ? 'text-emerald-400' : 'text-gray-400'
                          }`} />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white">
                              {feature.title}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                        <div className={`ml-3 p-1 rounded-full transition ${
                          isSelected ? 'bg-emerald-500' : 'bg-white/10'
                        }`}>
                          {isSelected ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-white/40" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              
              {/* Phone Number Input (if text notifications selected) */}
              {selectedFeatures.textNotifications && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4"
                >
                  <label className="block text-xs font-sans text-gray-400 mb-1">
                    Phone Number for SMS
                  </label>
                  <div className="flex items-center">
                    <div className="p-2 rounded-l-lg bg-white/5 border border-r-0 border-white/10">
                      <Smartphone className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-r-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </motion.div>
              )}
              
              
              {/* What's Included - Compact */}
              <div className="p-3 rounded-lg bg-white/5 mb-4">
                <p className="text-xs text-gray-400 mb-2">
                  <span className="font-semibold text-white">Also included:</span> Weekly reports • Personalized tips • Priority support • Export calendar (.ics)
                </p>
                <p className="text-xs text-gray-500">
                  Cancel anytime, no commitment required
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition font-sans"
                >
                  Maybe Later
                </button>
                
                <button
                  onClick={onSubscribe}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-sans font-semibold text-sm text-white hover:shadow-lg hover:shadow-emerald-500/25 transition flex items-center group"
                >
                  <CreditCard className="w-4 h-4 mr-1.5" />
                  Start 7-Day Free Trial
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}