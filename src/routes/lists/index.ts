import { FastifyInstance } from 'fastify'
import * as listsController from '../../controllers/listsController'

async function lists(fastify: FastifyInstance) {

  fastify.get('/', listsController.listLists)

  // TODO implement addList in controller
  // fastify.post('/', listsController.addList)
  fastify.post('/', listsController.addList);
  fastify.put('/:id', listsController.updateList);
  fastify.post('/:id/items', listsController.addItemToList)
  fastify.delete('/:listId/items/:itemId', listsController.deleteItemFromList)
  fastify.put('/:listId/items/:itemId', listsController.updateItemInList)
}

export default lists