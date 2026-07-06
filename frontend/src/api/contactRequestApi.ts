import api from "./axios";
import type {
    ContactRequestItem,
    CreateContactRequestRequest,
} from "../types/contactRequest";

export async function createContactRequest(
    request: CreateContactRequestRequest
): Promise<ContactRequestItem> {
    const response = await api.post<ContactRequestItem>("/contactrequests", request);
    return response.data;
}

export async function getSentContactRequests(): Promise<ContactRequestItem[]> {
    const response = await api.get<ContactRequestItem[]>("/contactrequests/sent");
    return response.data;
}

export async function getReceivedContactRequests(): Promise<ContactRequestItem[]> {
    const response = await api.get<ContactRequestItem[]>(
        "/contactrequests/received"
    );
    return response.data;
}

export async function acceptContactRequest(
    id: string
): Promise<ContactRequestItem> {
    const response = await api.put<ContactRequestItem>(
        `/contactrequests/${id}/accept`
    );
    return response.data;
}

export async function rejectContactRequest(
    id: string
): Promise<ContactRequestItem> {
    const response = await api.put<ContactRequestItem>(
        `/contactrequests/${id}/reject`
    );
    return response.data;
}

export async function cancelContactRequest(
    id: string
): Promise<ContactRequestItem> {
    const response = await api.put<ContactRequestItem>(
        `/contactrequests/${id}/cancel`
    );
    return response.data;
}