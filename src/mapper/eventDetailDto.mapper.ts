import { IEventDetail } from "../database/models/Event.model";
import IEventDetailDto from "../dto/eventDetail.dto";
import { OrganizerType } from "../constants/event.constants";

export default class EventDetailDtoMapper {
    static toEventDetailDto(event: IEventDetail): IEventDetailDto {
        const owner = event.organizerType === OrganizerType.USER
            ? {
                firstName: event.userOwner?.firstname || '',
                id: event.userOwner?.id || 0
            }
            : {
                firstName: event.clubOwner?.name || '',
                id: event.clubOwner?.id || 0
            };

        const eventDetailDto: IEventDetailDto = {
            id: event.event_id.toString(),
            description: event.description,
            schedule: event.schedule,
            location: event.location,
            expertise: event.expertise,
            sportId: event.sportId,
            remaining: event.remaining,
            status: event.status,
            owner
        }
        return eventDetailDto;
    }
}