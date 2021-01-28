import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';
import { RestaurantService } from './restaurants.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  getOrCreate: jest.fn(),
  findWithPagination: jest.fn(),
  count: jest.fn(),
});

const OWNER: User = new User();
OWNER.id = 1;
OWNER.email = 'owner@owner.com';
OWNER.role = UserRole.Owner;
OWNER.verified = true;
OWNER.createdAt = new Date();
OWNER.updateAt = new Date();

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type CategoryMockRepository = Partial<
  Record<keyof CategoryRepository, jest.Mock>
>;
type RestaurantMockRepository = Partial<
  Record<keyof RestaurantRepository, jest.Mock>
>;

describe('RestaurantService', () => {
  let service: RestaurantService;
  let restaurantsRepository: RestaurantMockRepository;
  let categoriesRepository: CategoryMockRepository;
  let dishesRepository: MockRepository<Dish>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: getRepositoryToken(RestaurantRepository),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(CategoryRepository),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Dish),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    service = module.get<RestaurantService>(RestaurantService);
    restaurantsRepository = module.get(
      getRepositoryToken(RestaurantRepository),
    );
    categoriesRepository = module.get(getRepositoryToken(CategoryRepository));
    dishesRepository = module.get(getRepositoryToken(Dish));
  });

  it('should be definded', () => {
    expect(service).toBeDefined();
  });

  describe('createRestaurant', () => {
    const createRestaurantInput = {
      name: 'new restaurant',
      coverImg: '',
      address: '',
      categoryName: 'new category',
    };
    const categoryName = 'new category';
    const categorySlug = 'new-category';
    it('should create a new restaurant', async () => {
      restaurantsRepository.create.mockReturnValue(createRestaurantInput);
      categoriesRepository.getOrCreate.mockResolvedValue({
        name: categoryName,
        slug: categorySlug,
      });
      const result = await service.createRestaurant(
        OWNER,
        createRestaurantInput,
      );
      expect(restaurantsRepository.create).toHaveBeenCalledTimes(1);
      expect(restaurantsRepository.create).toHaveBeenCalledWith(
        createRestaurantInput,
      );

      expect(categoriesRepository.getOrCreate).toHaveBeenCalledTimes(1);
      expect(categoriesRepository.getOrCreate).toHaveBeenCalledWith(
        categoryName,
      );

      expect(restaurantsRepository.save).toHaveBeenCalledTimes(1);
      expect(restaurantsRepository.save).toHaveBeenCalledWith(
        createRestaurantInput,
      );
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      restaurantsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createRestaurant(
        OWNER,
        createRestaurantInput,
      );
      expect(result).toEqual({
        ok: false,
        error: 'Could not create restaurant',
      });
    });
  });

  describe('editRestaurant', () => {});
  it.todo('deleteRestaurant');
  it.todo('restaurants');
  it.todo('restaurant');
  it.todo('searchRestaurant');
});
