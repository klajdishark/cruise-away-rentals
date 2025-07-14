import React, {useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Filter, Percent, Plus, Search, Tag, TrendingUp, Users} from 'lucide-react';

const promotions = [
    {
        id: 'PROMO001',
        code: 'SUMMER20',
        description: 'Summer Special 20% Off',
        type: 'percentage',
        value: 20,
        usageLimit: 1000,
        usageCount: 347,
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        status: 'active',
    },
    {
        id: 'PROMO002',
        code: 'FIRST50',
        description: 'First Time Customer $50 Off',
        type: 'fixed',
        value: 50,
        usageLimit: 500,
        usageCount: 127,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
    },
    {
        id: 'PROMO003',
        code: 'WEEKEND15',
        description: 'Weekend Getaway 15% Off',
        type: 'percentage',
        value: 15,
        usageLimit: 200,
        usageCount: 89,
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        status: 'expired',
    },
    {
        id: 'PROMO004',
        code: 'LOYALTY100',
        description: 'Loyalty Reward $100 Off',
        type: 'fixed',
        value: 100,
        usageLimit: 50,
        usageCount: 23,
        startDate: '2024-02-01',
        endDate: '2024-06-30',
        status: 'active',
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'expired':
            return 'bg-gray-100 text-gray-800';
        case 'paused':
            return 'bg-yellow-100 text-yellow-800';
        case 'draft':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const PromotionsDiscounts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredPromotions = promotions.filter(promo => {
        const matchesSearch = promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || promo.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Promotions & Discounts</h1>
                    <p className="text-muted-foreground">Manage promotional codes and discount campaigns</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2"/>
                    Create Promotion
                </Button>
            </div>

            {/* Promotion Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Currently running</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,347</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,280</div>
                        <p className="text-xs text-muted-foreground">Customer savings</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24.8%</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+3.2%</span> from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performing Promotions */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Promotions</CardTitle>
                    <CardDescription>Most used promotional codes this month</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {promotions.slice(0, 3).map((promo) => (
                            <div key={promo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <div className="font-medium">{promo.code}</div>
                                    <div className="text-sm text-muted-foreground">{promo.description}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">{promo.usageCount} uses</div>
                                    <div className="text-sm text-muted-foreground">
                                        {((promo.usageCount / promo.usageLimit) * 100).toFixed(1)}% of limit
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Promotions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Promotions</CardTitle>
                    <CardDescription>Manage your promotional campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    placeholder="Search promotions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2"/>
                            Filter
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPromotions.map((promo) => (
                                <TableRow key={promo.id}>
                                    <TableCell className="font-medium">{promo.code}</TableCell>
                                    <TableCell>{promo.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {promo.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{promo.usageCount} / {promo.usageLimit}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {((promo.usageCount / promo.usageLimit) * 100).toFixed(1)}% used
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{promo.startDate}</div>
                                            <div className="text-muted-foreground">to {promo.endDate}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(promo.status)}>
                                            {promo.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">Edit</Button>
                                            <Button variant="outline" size="sm">
                                                {promo.status === 'active' ? 'Pause' : 'Activate'}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
