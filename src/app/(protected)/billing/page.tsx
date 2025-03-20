"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { api } from "@/trpc/react"
import { Info } from "lucide-react"
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
        <div>
            <h1 className="text-2xl font-semibold">Billing</h1>
            <div className="h-2"></div>
            <p className="text-sm text-gray-500">
                You currently have <span className="font-bold">{user?.credits || 0}</span> credits.
            </p>

            {/* Info Box */}
            <div className="h-2"></div>
            <div className="bg-violet-50 px-4 py-3 rounded-md border border-violet-500 text-violet-800">
                <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm">Each credit allows you to index 1 file in a repository</p>
                </div>
                <p className="text-sm">E.g. If your project has 100 files, you will need 100 credits to index it.</p>
            </div>

            {/* Credit Purchase Slider */}
            <div className="h-4"></div>
            <Slider defaultValue={[100]} max={1000} min={10} step={10}
                onValueChange={value => setCreditsToBuy(value)}
                value={creditsToBuy}
            />
            <div className="h-4"></div>
            <Button onClick={() => addTransaction.mutate({ credits: creditsToBuyAmount })}>
                Buy {creditsToBuyAmount} credits for ₹{price}
            </Button>

            {/* Transaction History */}
            <div className="h-6"></div>
            <h2 className="text-lg font-semibold">Transaction History</h2>
            <div className="h-2"></div>
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                {transactions && transactions.length > 0 ? (
                    <ul className="text-sm">
                        {transactions.map((txn) => (
                            <li key={txn.id} className="py-1 flex justify-between border-b border-gray-200">
                                <span>{txn.credits > 0 ? "Purchased" : "Deducted"} {Math.abs(txn.credits)} credits</span>
                                <span className="text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No transactions yet.</p>
                )}
            </div>

            {/* Dialog Popup */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Development Mode</DialogTitle>
                        <DialogDescription>
                            Since the app is in development, credits are free for now. Enjoy using the platform without any cost!
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowDialog(false)}>Got it!</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default BillingPage
