import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

import { WorkItemService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    type: z.enum(['email', 'message', 'document', 'calendar', 'task']),
    source: z.string().min(1, 'Source is required'),
    preview: z.string().optional(),
});

interface AddWorkItemDialogProps {
    threadId?: string;
}

export function AddWorkItemDialog({ threadId }: AddWorkItemDialogProps) {
    const [open, setOpen] = useState(false);
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            type: 'task',
            source: 'Manual',
            preview: '',
        },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (values: z.infer<typeof formSchema>) => {
            if (!currentUser) throw new Error('Not authenticated');

            return WorkItemService.createItem({
                ...values,
                userId: currentUser.id,
                threadId,
                timestamp: new Date(),
                isRead: true,
                metadata: {},
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            if (threadId) {
                queryClient.invalidateQueries({ queryKey: ['threadItems', threadId] });
            }
            setOpen(false);
            form.reset();
            toast.success('Work item added successfully');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Failed to add work item');
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutate(values);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Related Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Work Item</DialogTitle>
                    <DialogDescription>
                        Manually add a work item to this thread.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Schedule follow-up meeting" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="message">Message</SelectItem>
                                                <SelectItem value="document">Document</SelectItem>
                                                <SelectItem value="calendar">Calendar</SelectItem>
                                                <SelectItem value="task">Task</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="source"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Manual, Slack, Gmail" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="preview"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preview / Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="What is this item about?"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Item
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
