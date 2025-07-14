import React, {useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {AlertTriangle, CheckCircle, Clock, Filter, MessageSquare, Plus, Search, Users} from 'lucide-react';

const tickets = [
    {
        id: 'TICK-001',
        customer: 'John Doe',
        subject: 'Vehicle not starting',
        category: 'Technical',
        priority: 'high',
        status: 'open',
        assignedTo: 'Mike Johnson',
        created: '2024-01-20 10:30',
        lastUpdate: '2024-01-20 14:15',
    },
    {
        id: 'TICK-002',
        customer: 'Jane Smith',
        subject: 'Booking modification request',
        category: 'Booking',
        priority: 'medium',
        status: 'in-progress',
        assignedTo: 'Sarah Wilson',
        created: '2024-01-19 16:45',
        lastUpdate: '2024-01-20 09:20',
    },
    {
        id: 'TICK-003',
        customer: 'Bob Davis',
        subject: 'Refund inquiry',
        category: 'Billing',
        priority: 'low',
        status: 'resolved',
        assignedTo: 'Tom Brown',
        created: '2024-01-18 11:20',
        lastUpdate: '2024-01-19 15:30',
    },
    {
        id: 'TICK-004',
        customer: 'Alice Johnson',
        subject: 'Vehicle damage report',
        category: 'Insurance',
        priority: 'high',
        status: 'open',
        assignedTo: null,
        created: '2024-01-20 08:15',
        lastUpdate: '2024-01-20 08:15',
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'open':
            return 'bg-red-100 text-red-800';
        case 'in-progress':
            return 'bg-yellow-100 text-yellow-800';
        case 'resolved':
            return 'bg-green-100 text-green-800';
        case 'closed':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high':
            return 'bg-red-100 text-red-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'low':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const SupportHelpdesk = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Support & Helpdesk</h1>
                    <p className="text-muted-foreground">Manage customer support tickets and inquiries</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2"/>
                    New Ticket
                </Button>
            </div>

            {/* Support Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">Awaiting response</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">18</div>
                        <p className="text-xs text-muted-foreground">Being worked on</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Issues solved</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2.4h</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">-15%</span> from last week
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Team Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Team Performance</CardTitle>
                    <CardDescription>Support agent statistics for this week</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-medium">Mike Johnson</div>
                                <div className="text-sm text-muted-foreground">Senior Support Agent</div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">32 tickets</div>
                                <div className="text-sm text-green-600">98% satisfaction</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-medium">Sarah Wilson</div>
                                <div className="text-sm text-muted-foreground">Support Agent</div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">28 tickets</div>
                                <div className="text-sm text-green-600">96% satisfaction</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-medium">Tom Brown</div>
                                <div className="text-sm text-muted-foreground">Support Agent</div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">25 tickets</div>
                                <div className="text-sm text-green-600">94% satisfaction</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Support Tickets Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Support Tickets</CardTitle>
                    <CardDescription>Manage and track customer support requests</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    placeholder="Search tickets..."
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
                                <TableHead>Ticket ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-medium">{ticket.id}</TableCell>
                                    <TableCell>{ticket.customer}</TableCell>
                                    <TableCell>{ticket.subject}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{ticket.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getPriorityColor(ticket.priority)}>
                                            {ticket.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(ticket.status)}>
                                            {ticket.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {ticket.assignedTo ? (
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2"/>
                                                {ticket.assignedTo}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{ticket.created}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">View</Button>
                                            <Button variant="outline" size="sm">Assign</Button>
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
