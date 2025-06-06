using Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Core.Specifications
{
    public class BaseSpecification<T> : ISpecification<T>
    {
        private readonly Expression<Func<T, bool>> _criteria;
        public BaseSpecification(Expression<Func<T, bool>> criteria)
        {
            _criteria = criteria;
        }
        public Expression<Func<T, bool>> Criteria => _criteria;
    }
}
