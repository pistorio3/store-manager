const sinon = require('sinon');
const { expect } = require('chai');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

const DBManager = require('./DBManager');
const DBMan = new DBManager();

const mongoConnection = require('../../models/connection');
const productsModel = require('../../models/productsModel');
const salesModel = require('../../models/salesModel');

describe('Testa o productsModel', () => {
  describe('Insere um novo produto no BD', () => {
    before(async () => await DBMan.start());
    after(async () => {
      await DBMan.stop();
      await DBMan.cleanup();
    });

    describe('Quando é inserido com sucesso', () => {

      it('Retorna um objeto', async () => {
        const response = await productsModel.create('Produto de teste', 5);

        expect(response).to.be.a('object');
      });

      it('O objeto possui o "_id" do novo produto', async () => {
        const response = await productsModel.create('Produto de teste', 5);

        expect(response).to.have.a.property('_id');
      });

      it('Deve existir um produto com o nome cadastrado!', async () => {
        await productsModel.create('Produto de teste', 5);
        const productCreated = await productsModel.getAll();
        expect(productCreated).to.be.not.null;
      });
    });

  });

  describe('Busca todos os produtos no BD', () => {
    before(async () => DBMan.start());
    after(async () => {
      DBMan.stop();
      DBMan.cleanup();
    });

    describe('Quando há produtos no BD', () => {
      it('Retorna um objeto', async () => {
        const response = await productsModel.getAll();
        expect(response).to.be.a('object');
      });

      it('O objeto possui a propriedade "products"', async () => {
        const response = await productsModel.getAll();

        expect(response).to.have.property('products');
      });

      it('Dentro da propriedade products deve ter um array de produtos', async () => {
        const response = await productsModel.getAll();

        expect(response.products).to.be.a('array');
      })
    })
  });

  describe('Busca um produto por ID', () => {
  let connectionMock;

    before(async () => {
      const DBServer = new MongoMemoryServer();
      const URLMock = await DBServer.getUri();

      connectionMock = await MongoClient
        .connect(URLMock, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        })
        .then((conn) => conn.db('StoreManager'));


      sinon.stub(mongoConnection, 'getConnection').resolves(connectionMock);
    });

    after(() => {
      mongoConnection.getConnection.restore();
    });

    describe('quando o produto existe', () => {
      it('retorna um objeto', async () => {
        const created = await productsModel.create('Produto teste 2', 20);
        const searched = await productsModel.getById(created._id);

        expect(searched).to.be.not.null;
      })
    });
  });

  describe('Apaga o produto, pelo ID', () => {

    before(async () => await DBMan.start());
    after(async () => {
      await DBMan.stop();
      await DBMan.cleanup();
    });

    describe('quando o produto existe', () => {
      it('retorna um objeto', async () => {
        const created = await productsModel.create('Produto teste 2', 20);
        const deleted = await productsModel.deleteById(created._id);

        expect(deleted).to.be.a('object');
      })

      it('o objeto tem a propriedade deletedCount = 1', async () => {
        const created = await productsModel.create('Produto teste 2', 20);
        const deleted = await productsModel.deleteById(created._id);

        expect(deleted.deletedCount).to.be.equal(1);
      });
    });

    describe('quando o produto não existe', () => {
      it('retorna um objeto', async () => {
        await productsModel.create('Produto teste 2', 20);
        const deleted = await productsModel.deleteById('6140db931694366c81c22700');

        expect(deleted).to.be.a('object');
      });

      it('o objeto tem a propriedade deletedCount = 0', async () => {
        await productsModel.create('Produto teste 2', 20);
        const deleted = await productsModel.deleteById('6140db931694366c81c22700');

        expect(deleted.deletedCount).to.be.equal(0);
      });
    })
  });

  describe('Atualiza o produto, pelo ID', () => {
    before(async () => await DBMan.start());
    after(async () => {
      await DBMan.stop();
      await DBMan.cleanup();
    });

    describe('Quando o produto existe', () => {
      it('retorna true', async () => {
        const newProduct = await productsModel.create('Produto teste 2', 20);
        const response = await productsModel.updateById(newProduct._id, 'Produto Novo Teste', 30);

        expect(response).to.be.equal(true);
      });
    });
  });

  describe('Atualiza o estoque quando há uma venda', () => {
    before(async () => await DBMan.start());
    after(async () => {
      await DBMan.stop();
      await DBMan.cleanup();
    });

    it('diminui o estoque quando a venda é feita', async () => {
      const newProduct = await productsModel.create('Produto teste 2', 20);
      const subtracted = await productsModel.subtractProductsQuantity(newProduct._id, 2);
      console.log(subtracted);
      expect(subtracted).to.be.equal(newProduct.quantity - 2);
    })
  })
});

describe('Testa o salesModel', () => {
  describe('Insere uma nova venda na BD', () => {
    before(async () => await DBMan.start());
    after(async () => {
      await DBMan.stop();
      await DBMan.cleanup();
    });

    describe('quando é inserida com sucesso', () => {
      it('retorna um objeto', async () => {
        const sale = await salesModel.create([{
          productId: '6140db931694366c81c22700',
          quantity: 2,
        }]);

        expect(sale).to.be.a('object');
      })
    })
  });

  describe('Lista todas as vendas do BD', () => {
    before(async () => await DBMan.start());
    after(async () => {
      await DBMan.stop();
      await DBMan.cleanup();
    });

    it('quando há vendas, retorna um objeto com a propriedade sales e um array dentro', async () => {
      const sales = await salesModel.getAll();

      expect(sales).to.be.a('object');
      expect(sales.sales).to.be.a('array');
    });
  });

  describe('Busca uma venda pelo ID', () => {
    it('Quando há a venda retorna os dados', async () => {
      const newSale = await salesModel.create([{
        productId: '6140db931694366c81c22700',
        quantity: 2,
      }]);
      const sale = await salesModel.getById(newSale._id);

      expect(sale).to.be.a('object');
      expect(sale).to.have.property('_id');
    })
  });

  describe('Apaga uma venda pelo ID', () => {
    before(async () => await DBMan.start());
    after(async () => {
      await DBMan.stop();
      await DBMan.cleanup();
    });
    describe('Quando a venda existe', () => {
      it('retorna um objeto', async () => {
        const sale = await salesModel.create([{
          productId: '6140db931694366c81c22700',
          quantity: 2,
        }]);
        const deleted = await salesModel.deleteById(sale._id);

        expect(deleted).to.be.a('object');
      })

      it('o objeto tem a propriedade deletedCount = 1', async () => {
        const sale = await salesModel.create([{
          productId: '6140db931694366c81c22700',
          quantity: 2,
        }]);
        const deleted = await salesModel.deleteById(sale._id);

        expect(deleted.deletedCount).to.be.equal(1);
      });
    });
  });

  describe('Atualiza uma venda no BD', () => {
    before(async () => await DBMan.start());
    after(async () => {
      await DBMan.stop();
      await DBMan.cleanup();
    });

    describe('Quando a venda existe', () => {
      it('retorna um objeto com a propriedade deletedCount = 1', async () => {
        const sale = await salesModel.create([{
          productId: '6140db931694366c81c22700',
          quantity: 2,
        }]);
        const updated = await salesModel.update(sale._id, {
          productId: '6140db931694366c81c22701',
          quantity: 3,
        });

        expect(updated.modifiedCount).to.be.equal(1);
      });
    });

    describe('Quando a venda não existe', () => {
      it('retorna um objeto com a propriedade deletedCount = 0', async () => {
        const updated = await salesModel.update('6140db931694366c81c22701', {
          productId: '6140db931694366c81c22701',
          quantity: 3,
        });

        expect(updated.modifiedCount).to.be.equal(0);
      })
    })
  });
});
