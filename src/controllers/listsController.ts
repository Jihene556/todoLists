import { FastifyReply, FastifyRequest } from "fastify"
import { ITodoList } from "../interfaces"
import { IItem } from "../interfaces"

// A function to display all the todo-lists
export async function listLists(this: any, 
  request: FastifyRequest, 
  reply: FastifyReply
) {
  console.log('DB status', this.level.db.status)
  const listsIter = this.level.db.iterator()

  const result: ITodoList[] = []
  for await (const [, value] of listsIter) {
    result.push(JSON.parse(value))
  }
  reply.send({ data: result })
}

// A function to add a new list
export async function addList(
  this: any,
  request: FastifyRequest, 
  reply: FastifyReply
){
  const list = request.body as ITodoList;
  
  try {
    const existingList = await this.level.db.get(list.id); 
    if (existingList) {
      return reply.status(409).send({ message: 'This list already exists' });
    }
  } catch (error) {
  }

  if (!list.description && list.items ) {
    return reply.status(400).send({ message: 'Please insert a description for the list you want to add' });
  }

  if (list.description && !list.items) {
    return reply.status(401).send({ message: 'Please insert items for the list you want to add' });
  }

  if (!list.description && !list.items) {
    return reply.status(402).send({ message: 'Please insert a description and items for the list you want to add' });
  }

  await this.level.db.put(list.id, JSON.stringify(list));  
  reply.status(201).send({ message: 'List added successfully' });
}

//Update the description of a list
export async function updateList(
  this: any,
  request: FastifyRequest<{ Params: { id: string }; Body: { description: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { description } = request.body;
    
  const listData = await this.level.db.get(id);
  if (!listData) {
    reply.status(404).send({ message: 'This list does not exist in the database' });
    return;
  }

  const list = JSON.parse(listData) as ITodoList;

  if (!description) {
    reply.status(400).send({ message: 'No new description provided' });
    return;
  }

  list.description = description;
  await this.level.db.put(id, JSON.stringify(list));
  reply.send({ message: `List successfully updated: ${list.description}` });
  
}

//Add an item to a list
export async function addItemToList(
  this: any,
  request: FastifyRequest<{ Params: { id: string }; Body: IItem }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { description, state } = request.body;

  const listData = await this.level.db.get(id);
  if (!listData) {
    reply.status(404).send({ message: 'This list does not exist in the database' });
    return;
  }

  const list = JSON.parse(listData) as ITodoList;
  const newItem: IItem = {
    // To generate a random item ID
    id: `item-${Math.random().toString(36).substring(2, 15)}`,
    description,
    state
  };

  list.items.push(newItem);
  await this.level.db.put(id, JSON.stringify(list));

  reply.status(200).send({ message: 'Item successfully added to the list' });
  
}

//Delete an item from the list 
export async function deleteItemFromList(
  this: any,
  request: FastifyRequest<{ Params: { listId: string; itemId: string } }>,  // Typing for params
  reply: FastifyReply
) {
  const { listId, itemId } = request.params;  
    
  const listData = await this.level.db.get(listId);

  if (!listData) {
    reply.status(404).send({ message: "This list does not exist in the database" });
    return;
  }

  const list = JSON.parse(listData) as ITodoList;
  const itemIndex = list.items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    reply.status(404).send({ message: "The item you want to delete does not exist in the database" });
    return;
  }

  list.items.splice(itemIndex, 1);
  await this.level.db.put(listId, JSON.stringify(list));
  reply.status(200).send({ message: "Item successfully deleted from the list" });
  
}

//update an item in the list (description or state or both)
export async function updateItemInList (
  this:any,
  request: FastifyRequest<{ Params: { listId: string; itemId: string }; Body: Partial<IItem> }>,
  reply: FastifyReply
) {
  const { listId, itemId } = request.params;
  const { description, state } = request.body;

  const list = await this.level.db.get(listId).catch(() => null);
  if (!list) {
    return reply.status(404).send({ message: 'this list does not exist in the database' });
  }

  const parsedList = JSON.parse(list);

  const item = parsedList.items.find((item: { id: string }) => item.id === itemId);;

  if (!item) {
    return reply.status(404).send({ message: 'Item not found in this list' });
  }

  // Update the item's state and/or description
  if (description !== undefined) item.description = description;
  if (state !== undefined) item.state = state;

  await this.level.db.put(listId, JSON.stringify(parsedList));
  reply.status(200).send({ message: 'Item updated successfully', item });
};

