import { Transaction } from "sequelize";
import Reservation from "../models/Reservation.model";
import TimeSlot from "../models/TimeSlot.model";
import Field from "../models/Field.model";
import Club from "../models/Club.model";
import { ReservationStatus } from "../../constants/reservation.constants";
import { SlotStatus } from "../../constants/slots.constants";

export default class ReservationPersistence {
    async startTransaction(): Promise<Transaction> {
        return await Reservation.sequelize!.transaction();
    }

    async createReservation(
        data: {
            eventId: number;
            fieldId: number;
            cost: number;
            status: ReservationStatus;
        },
        slotIds: number[],
        transaction: Transaction
    ): Promise<Reservation> {
        // Create the reservation
        const reservation = await Reservation.create(data, { transaction });

        // Update the time slots to link them to this reservation
        await TimeSlot.update(
            {
                reservationId: reservation.id,
                slotStatus: SlotStatus.BOOKED
            },
            {
                where: { id: slotIds },
                transaction
            }
        );

        return reservation;
    }

    async findById(reservationId: number): Promise<Reservation | null> {
        return await Reservation.findOne({
            where: { id: reservationId },
            include: [
                {
                    model: TimeSlot,
                    attributes: ['id', 'start_time', 'end_time', 'availability_date']
                },
                {
                    model: Field,
                    attributes: ['id', 'name', 'club_id'],
                    include: [{
                        model: Club,
                        attributes: ['id', 'name']
                    }]
                }
            ]
        });
    }

    async findByEventId(eventId: number): Promise<Reservation | null> {
        return await Reservation.findOne({
            where: { eventId },
            include: [
                {
                    model: TimeSlot,
                    attributes: ['id', 'start_time', 'end_time', 'availability_date']
                },
                {
                    model: Field,
                    attributes: ['id', 'name', 'club_id'],
                    include: [{
                        model: Club,
                        attributes: ['id', 'name']
                    }]
                }
            ]
        });
    }

    async updateStatus(
        reservationId: number, 
        status: ReservationStatus,
        transaction?: Transaction
    ): Promise<Reservation> {
        const options = transaction ? { transaction } : {};
        
        await Reservation.update(
            { status },
            {
                where: { id: reservationId },
                ...options
            }
        );

        return (await this.findById(reservationId))!;
    }

    async deleteReservation(
        reservationId: number,
        transaction: Transaction
    ): Promise<void> {
        await Reservation.destroy({
            where: { id: reservationId },
            transaction
        });
    }

    async findConflictingReservations(
        fieldId: number,
        slotIds: number[]
    ): Promise<Reservation[]> {
        return await Reservation.findAll({
            include: [{
                model: TimeSlot,
                where: {
                    id: slotIds,
                    field_id: fieldId,
                    slotStatus: SlotStatus.BOOKED
                }
            }]
        });
    }

    async findByClub(clubId: number, status?: ReservationStatus): Promise<Reservation[]> {
        const whereClause: any = {
            '$field.club_id$': clubId
        };
        
        if (status) {
            whereClause.status = status;
        }

        return await Reservation.findAll({
            where: whereClause,
            include: [
                {
                    model: TimeSlot,
                    attributes: ['id', 'start_time', 'end_time', 'availability_date']
                },
                {
                    model: Field,
                    attributes: ['id', 'name', 'club_id'],
                    include: [{
                        model: Club,
                        attributes: ['id', 'name']
                    }]
                }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async findAllByEventId(eventId: number): Promise<Reservation[]> {
        return await Reservation.findAll({
            where: { eventId },
            include: [
                {
                    model: TimeSlot,
                    attributes: ['id', 'start_time', 'end_time', 'availability_date']
                },
                {
                    model: Field,
                    attributes: ['id', 'name', 'club_id'],
                    include: [{
                        model: Club,
                        attributes: ['id', 'name']
                    }]
                }
            ],
            order: [['created_at', 'DESC']]
        });
    }
} 