import { EntityRepository, Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant> {
  async findWithPagination(
    where: Record<string, unknown>,
    page: number,
  ): Promise<[Restaurant[], number, number]> {
    const [restaurants, totalResults] = await this.findAndCount({
      where,
      skip: (page - 1) * 3,
      take: 3,
      order: {
        isPromoted: 'DESC',
      },
    });
    const totalPages = Math.ceil(totalResults / 3);
    return [restaurants, totalResults, totalPages];
  }
}
