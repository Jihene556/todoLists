import { FastifyReply, FastifyRequest } from "fastify"
import { ITodoList } from "../interfaces"
import { IItem } from "../interfaces"

const staticLists: ITodoList[] = [
  {
	id: 'l-1',
	description: 'Dev tasks',
  items: [{
    "id": "item-1",
    "description": "finish the workshop",
    "state": "PENDING"
  },],
  },
  {
  id: 'l-2',
	description: 'Dev tasks2',
  items: [{"id": "item-2",
      "description": "send the work to the professor",
      "state": "IN-PROGRESS"},]
  }
]

export const listLists = async (
 request: FastifyRequest, 
 reply: FastifyReply) => {

  Promise.resolve(staticLists)
  .then((item) => {
	reply.send({ data: item })
  })
}

// A function that returns the list corresponding to a given id 
function getListById(id: string): ITodoList | undefined {
  return staticLists.find((list) => list.id === id);
}

// A function that adds a new list 
export const addList = async (request: FastifyRequest<{ Body: ITodoList }>, reply: FastifyReply) => {
  const { id, description, items } = request.body;
  const existingList = await getListById(id); 
  
  if (existingList) {
    reply.status(409).send({ message: 'This list already exists' });
    return;
  }

  if (!description && items) {
    reply.status(400).send({ message: 'please insert a description for the list you want to add' });
    return;
  }

  else if (description && !items) {
    reply.status(401).send({ message: 'please insert items for the list you want to add' });
    return;
  }

  else if (!description && !items) {
    reply.status(402).send({ message: 'please insert a description and items for the list you want to add' });
    return;
  }
  reply.send({ message: `added list: ${description}` });
};

//Update the description of a list
export const updateList = async (request: FastifyRequest<{ Params: { id: string }, Body: { description: string } }>, reply: FastifyReply) => {
  const { id } = request.params;
  const { description } = request.body;
  const list = await getListById(id)
  if (!list) {
    reply.status(404).send({ message: 'this list does not exist in the database.' });
    return;
  }
  if (!description) {
    return reply.status(400).send({ message: 'No new description provided'})
  }
  list.description = description;

  reply.send({ message: `List successfully updated: ${list.description}` });
}

//Add an item to a list
export const addItemToList = async (request: FastifyRequest<{ Params: { id: string }; Body: IItem }>, reply: FastifyReply) => {
  const { id } = request.params;
  const { description, state } = request.body;
  
  const list = staticLists.find((list) => list.id === id);
  if (!list) {
    reply.status(404).send({ message: 'this list does not exist in the database' });
    return;
  }

  const newItem: IItem = {
    // Generating a unique id 
    id: `item-${Math.random().toString(36).substring(2, 15)}`, 
    description,
    state
  };

  list.items.push(newItem);
  reply.status(200).send({ message: 'Item successfully added to the list' });
};

//Delete an item from the list 
export const deleteItemFromList = async (request: FastifyRequest<{ Params: { listId: string; itemId: string } }>, reply: FastifyReply) => {
  const { listId, itemId } = request.params;

  const list = staticLists.find((list) => list.id === listId);
  if (!list) {
    reply.status(404).send({ message: 'this list does not exist in the database' });
    return;
  }

  const itemIndex = list.items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) {
    return reply.status(404).send({ message: 'Item not found in this list' });
  }

  list.items.splice(itemIndex, 1);
  reply.status(200).send({ message: 'Item successfully deleted from the list' });
};

//update an item in the list (description or state)
export const updateItemInList = async (
  request: FastifyRequest<{ Params: { listId: string; itemId: string }; Body: Partial<IItem> }>,
  reply: FastifyReply
) => {
  const { listId, itemId } = request.params;
  const { description, state } = request.body;

  const list = staticLists.find((l) => l.id === listId);
  if (!list) {
    return reply.status(404).send({ message: 'this list does not exist in the database' });
  }

  const item = list.items.find((item) => item.id === itemId);
  if (!item) {
    return reply.status(404).send({ message: 'Item not found in this list' });
  }

  // Update the item's properties
  if (description !== undefined) item.description = description;
  if (state !== undefined) item.state = state;

  reply.status(200).send({ message: 'Item updated successfully', item });
};

