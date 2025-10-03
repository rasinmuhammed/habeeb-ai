"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { api } from "@/trpc/react"
import { Info, CreditCard, Zap, TrendingUp } from "lucide-react"
import React from "react"

const BillingPage = () => {
    const { data: user, refetch: refetchCredits } = api.project.getMyCredits.useQuery()
    const { data: transactions, refetch: refetchTransactions } = api.project.getTransactions.useQuery()
    const addTransaction = api.project.addMockTransaction.useMutation({
        onSuccess: () => {
            refetchCredits()
            refetchTransactions()
            setShowDialog(true)
        }
    })

    const [creditsToBuy, setCreditsToBuy] = React.useState<number[]>([100])
    const [showDialog, setShowDialog] = React.useState(false)
    const creditsToBuyAmount = creditsToBuy[0]!
    const price = (creditsToBuyAmount * 5).toFixed(2)

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Credits</h1>
                    <p className="text-gray-600">Manage your credits and view transaction history</p>
                </div>

                {/* Credit Balance Card */}
                <div className="grid gap-6 md:grid-cols-2 mb-8">
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Zap className="h-6 w-6" />
                            </div>
                            <span className="text-violet-100 text-sm font-medium">Current Balance</span>
                        </div>
                        <div className="mb-2">
                            <p className="text-5xl font-bold">{user?.credits || 0}</p>
                            <p className="text-violet-100 text-sm mt-1">Available Credits</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">How Credits Work</h3>
                                <p className="text-sm text-gray-600">1 credit = 1 file indexed</p>
                            </div>
                        </div>
                        <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
                            <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-violet-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-violet-800">
                                    Each credit allows you to index 1 file in a repository. 
                                    A project with 100 files will need 100 credits to index.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Purchase Credits Section */}
                <div className="bg-white rounded-2xl border shadow-sm p-8 mb-8">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-violet-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Purchase Credits</h2>
                        </div>
                        <p className="text-gray-600">Select the number of credits you'd like to purchase</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-medium text-gray-700">
                                    Number of Credits
                                </label>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-violet-600">{creditsToBuyAmount}</p>
                                    <p className="text-sm text-gray-500">credits</p>
                                </div>
                            </div>
                            <Slider 
                                defaultValue={[100]} 
                                max={1000} 
                                min={10} 
                                step={10}
                                onValueChange={value => setCreditsToBuy(value)}
                                value={creditsToBuy}
                                className="mb-4"
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>10 credits</span>
                                <span>1000 credits</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 border">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-700">Credits</span>
                                <span className="font-semibold text-gray-900">{creditsToBuyAmount}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-700">Price per credit</span>
                                <span className="font-semibold text-gray-900">₹5.00</span>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-violet-600">₹{price}</span>
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={() => addTransaction.mutate({ credits: creditsToBuyAmount })}
                            disabled={addTransaction.isPending}
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            {addTransaction.isPending ? (
                                <>
                                    <span className="animate-spin mr-2">⚙️</span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="mr-2 h-5 w-5" />
                                    Buy {creditsToBuyAmount} credits for ₹{price}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-2xl border shadow-sm p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction History</h2>
                        <p className="text-gray-600">View all your credit purchases and usage</p>
                    </div>

                    {transactions && transactions.length > 0 ? (
                        <div className="space-y-3">
                            {transactions.map((txn) => (
                                <div 
                                    key={txn.id} 
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                            txn.credits > 0 
                                                ? 'bg-green-100' 
                                                : 'bg-red-100'
                                        }`}>
                                            {txn.credits > 0 ? (
                                                <TrendingUp className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <Zap className="h-5 w-5 text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {txn.credits > 0 ? "Purchased" : "Deducted"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${
                                            txn.credits > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {txn.credits > 0 ? '+' : ''}{Math.abs(txn.credits)}
                                        </p>
                                        <p className="text-sm text-gray-500">credits</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500">No transactions yet</p>
                            <p className="text-sm text-gray-400 mt-1">Your transaction history will appear here</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog Popup */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">🎉 Development Mode</DialogTitle>
                        <DialogDescription className="text-base pt-2">
                            Since the app is in development, credits are free for now. Enjoy using the platform without any cost!
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            onClick={() => setShowDialog(false)}
                            className="w-full bg-violet-600 hover:bg-violet-700"
                        >
                            Got it, thanks!
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default BillingPage