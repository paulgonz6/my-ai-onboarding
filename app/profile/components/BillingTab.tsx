'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/app/contexts/AuthContext'
import { useSubscription } from '@/hooks/useProfile'
import { 
  CreditCard, 
  Calendar,
  Check,
  ArrowRight,
  Download,
  AlertCircle,
  Loader2,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: string
  period: string
  features: string[]
  popular?: boolean
  current?: boolean
}

const plans: Plan[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    price: '$0',
    period: 'forever',
    features: [
      'Your custom 90-day plan',
      'First week of daily sessions',
      'Core onboarding exercises',
      'See your progress',
    ],
  },
  {
    id: 'accelerator',
    name: 'Accelerator',
    price: '$19',
    period: '/month',
    features: [
      'Everything in Explorer',
      'Calendar integration',
      'All 90 days of exercises',
      'Progress analytics',
      'Priority support',
      'Templates library',
    ],
    popular: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$49',
    period: '/user/month',
    features: [
      'Everything in Accelerator',
      'Team analytics dashboard',
      'Custom exercises for your team',
      'ROI reporting',
      'Slack integration',
      'Dedicated success manager',
    ],
  },
]

export default function BillingTab() {
  const { user, profile } = useAuth()
  const { subscription, loading: subLoading, upgradeSubscription, cancelSubscription } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const currentPlan = subscription?.plan || 'explorer'

  const handleUpgrade = async (planId: string) => {
    setLoading(true)
    try {
      await upgradeSubscription(planId)
    } catch (error) {
      console.error('Upgrade failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
      setLoading(true)
      try {
        await cancelSubscription()
        alert('Subscription will be cancelled at the end of the billing period')
      } catch (error) {
        console.error('Cancel failed:', error)
        alert('Failed to cancel subscription. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-display font-semibold mb-6">Current Subscription</h3>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="text-2xl font-bold">
                {currentPlan === 'explorer' && 'Explorer Plan'}
                {currentPlan === 'accelerator' && 'Accelerator Plan'}
                {currentPlan === 'team' && 'Team Plan'}
              </h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                subscription?.status === 'active' 
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : subscription?.status === 'canceled'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {subscription?.status === 'active' ? 'Active' : subscription?.status || 'Inactive'}
              </span>
            </div>
            <p className="text-gray-400">
              {currentPlan === 'explorer' && 'Free forever - No credit card required'}
              {currentPlan === 'accelerator' && 'Full access to all features'}
              {currentPlan === 'team' && 'Perfect for teams and organizations'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">
              {currentPlan === 'explorer' && '$0'}
              {currentPlan === 'accelerator' && '$19'}
              {currentPlan === 'team' && '$49'}
            </p>
            <p className="text-sm text-gray-400">
              {currentPlan === 'explorer' ? 'forever' : currentPlan === 'team' ? 'per user/month' : 'per month'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold">Ready to accelerate your journey?</span>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            Upgrade to Accelerator and unlock calendar integration, all 90 days of content, and more.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUpgrade(!showUpgrade)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium text-sm"
          >
            View Upgrade Options
          </motion.button>
        </div>
      </motion.div>

      {/* Upgrade Options */}
      {showUpgrade && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative bg-white/5 backdrop-blur-xl rounded-2xl border p-6
                ${plan.popular ? 'border-emerald-500/50' : 'border-white/10'}
                ${plan.id === currentPlan ? 'opacity-50' : ''}
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-xs font-semibold">
                  Most Popular
                </div>
              )}
              
              <h4 className="text-xl font-display font-semibold mb-2">{plan.name}</h4>
              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.id === currentPlan ? (
                <button disabled className="w-full py-3 bg-white/5 rounded-xl font-medium text-gray-400 cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUpgrade(plan.id)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium"
                >
                  Upgrade to {plan.name}
                </motion.button>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-display font-semibold mb-4">Payment Method</h3>
        {subscription?.stripe_customer_id ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded flex items-center justify-center">
                <CreditCard className="w-6 h-4" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-400">Expires 12/25</p>
              </div>
            </div>
            <button className="text-emerald-400 hover:text-emerald-300 transition">
              Update
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No payment method on file</p>
            <p className="text-sm text-gray-500">Add a payment method when you upgrade to a paid plan</p>
          </div>
        )}
      </motion.div>

      {/* Billing History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display font-semibold">Billing History</h3>
          <button className="text-emerald-400 hover:text-emerald-300 transition flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span className="text-sm">Export All</span>
          </button>
        </div>
        
        <div className="text-center py-8 text-gray-400">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p>No billing history yet</p>
          <p className="text-sm text-gray-500 mt-1">Your invoices will appear here when you upgrade</p>
        </div>
      </motion.div>

      {/* Cancel Subscription */}
      {currentPlan !== 'explorer' && subscription?.status === 'active' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-500/5 backdrop-blur-xl rounded-2xl border border-red-500/20 p-6"
        >
          <h3 className="text-xl font-display font-semibold mb-4 text-red-400">Danger Zone</h3>
          <p className="text-gray-400 mb-4">
            Cancel your subscription and downgrade to the free Explorer plan. You'll lose access to premium features.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCancelSubscription}
            disabled={loading}
            className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl font-medium text-red-400 hover:bg-red-500/30 transition disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Cancelling...</span>
              </span>
            ) : (
              'Cancel Subscription'
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}