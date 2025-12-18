import { Prisma, US_ROLE } from "@prisma/client";
import { prisma } from "../../../infrastructure/database/client.js";

export class BorrowReturnRepository {
    /**
     * Description: ดึงรายการ Borrow-Return Tickets พร้อม pagination และ filtering
     * Author: Pakkapon Chomchoey (Tonnam) 66160080
     */
    async findPaginated(params: {
        role: string | undefined;
        dept_id: number | null | undefined;
        sec_id: number | null | undefined;
        page?: number | null;
        limit?: number | null;
        status?: any;
        search?: string | null;
        sortField?: string | null;
        sortDirection?: "asc" | "desc" | null;
    }) {
        const {
            role,
            dept_id,
            sec_id,
            page: pageParam,
            limit: limitParam,
            status,
            search,
            sortField,
            sortDirection,
        } = params;
        const page = pageParam || 1;
        const limit = limitParam || 10;
        const skip = (page - 1) * limit;

        // สร้าง orderBy ตาม sortField
        let orderBy: Prisma.borrow_return_ticketsOrderByWithRelationInput = {
            created_at: "desc",
        };
        if (sortField) {
            const direction = sortDirection || "asc";
            switch (sortField) {
                case "device_name":
                    orderBy = { ticket_devices: { _count: direction } };
                    break;
                case "quantity":
                    orderBy = { brt_quantity: direction };
                    break;
                case "requester":
                    orderBy = { requester: { us_firstname: direction } };
                    break;
                case "request_date":
                    orderBy = { brt_start_date: direction };
                    break;
                case "status":
                    orderBy = { brt_status: direction };
                    break;
            }
        }

        const where: Prisma.borrow_return_ticketsWhereInput = {
            deleted_at: null,
            brt_status: status
                ? status
                : {
                    in: ["PENDING", "IN_USE", "APPROVED"],
                },
        };

        if (search) {
            const searchNum = Number(search);
            where.OR = [
                { requester: { us_firstname: { contains: search, mode: "insensitive" } } },
                { requester: { us_lastname: { contains: search, mode: "insensitive" } } },
                { requester: { us_emp_code: { contains: search, mode: "insensitive" } } },
                {
                    ticket_devices: {
                        some: {
                            child: {
                                device: {
                                    de_name: { contains: search, mode: "insensitive" },
                                },
                            },
                        },
                    },
                },
                {
                    ticket_devices: {
                        some: {
                            child: {
                                device: {
                                    de_serial_number: { contains: search, mode: "insensitive" },
                                },
                            },
                        },
                    },
                },
                {
                    ticket_devices: {
                        some: {
                            child: {
                                device: {
                                    category: {
                                        ca_name: { contains: search, mode: "insensitive" },
                                    },
                                },
                            },
                        },
                    },
                },
            ];
            if (!isNaN(searchNum)) {
                where.OR.push({ brt_id: searchNum });
            }
        }

        // Filter: เห็นเฉพาะ request ที่ stage ของตัวเอง = PENDING
        where.stages = {
            some: {
                brts_status: "PENDING",
                brts_role: role as US_ROLE,
                AND: [
                    { OR: [{ brts_dept_id: null }, { brts_dept_id: dept_id }] },
                    { OR: [{ brts_sec_id: null }, { brts_sec_id: sec_id }] },
                ],
            },
        };

        const [total, items] = await Promise.all([
            prisma.borrow_return_tickets.count({ where }),
            prisma.borrow_return_tickets.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    requester: {
                        select: {
                            us_id: true,
                            us_firstname: true,
                            us_lastname: true,
                            us_emp_code: true,
                            us_images: true,
                            department: { select: { dept_name: true, dept_id: true } },
                            section: { select: { sec_name: true, sec_id: true } },
                        },
                    },
                    ticket_devices: {
                        include: {
                            child: {
                                select: {
                                    device: {
                                        select: {
                                            de_serial_number: true,
                                            de_name: true,
                                            de_description: true,
                                            de_location: true,
                                            de_max_borrow_days: true,
                                            de_images: true,
                                            category: { select: { ca_name: true } },
                                            section: {
                                                select: {
                                                    sec_name: true,
                                                    department: { select: { dept_name: true } },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
        ]);

        return { total, items };
    }

    /**
     * Description: ดึงรายละเอียด Borrow-Return Ticket ตาม ID
     * Author: Pakkapon Chomchoey (Tonnam) 66160080
     */
    async getById(id: number) {
        return await prisma.borrow_return_tickets.findUnique({
            where: { brt_id: id },
            include: {
                requester: {
                    select: {
                        us_id: true,
                        us_firstname: true,
                        us_lastname: true,
                        us_emp_code: true,
                        us_images: true,
                        us_email: true,
                        us_phone: true,
                    },
                },
                ticket_devices: {
                    include: {
                        child: {
                            select: {
                                dec_id: true,
                                dec_serial_number: true,
                                dec_asset_code: true,
                                dec_has_serial_number: true,
                                dec_status: true,
                                device: {
                                    select: {
                                        accessories: {
                                            select: {
                                                acc_id: true,
                                                acc_name: true,
                                                acc_quantity: true,
                                            },
                                        },
                                    },
                                },

                            },
                        },
                    },
                },
                stages: {
                    orderBy: { brts_step_approve: "asc" },
                    include: {
                        approver: {
                            select: { us_firstname: true, us_lastname: true, us_role: true },
                        },
                    },
                },
            },
        });
    }
}

