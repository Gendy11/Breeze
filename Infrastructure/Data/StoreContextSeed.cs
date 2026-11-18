using Core.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class StoreContextSeed
    {
        public static async Task SeedAsync(StoreContext context, UserManager<AppUser> userManager, string? adminPassword)
        {
            // Seed files are copied next to the app's binaries (see Infrastructure.csproj),
            // so this works both locally and when published to a server.
            var path = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);

            // The admin password comes from configuration ("AdminPassword"), never from source code.
            if (!string.IsNullOrEmpty(adminPassword) && !userManager.Users.Any(x => x.UserName == "admin@test.com"))
            {
                var user = new AppUser
                {
                    UserName = "admin@test.com",
                    Email = "admin@test.com",
                };
                var result = await userManager.CreateAsync(user, adminPassword);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "Admin");
                }
                else
                {
                    Console.WriteLine("Admin user was not created: " +
                        string.Join("; ", result.Errors.Select(e => e.Description)));
                }
            }
            if (!context.Products.Any())
            {
                var productsData = await File.ReadAllTextAsync(Path.Combine(path!, "Data", "SeedData", "products.json"));
                var products = JsonSerializer.Deserialize<List<Product>>(productsData);

                if (products == null) return;

                context.Products.AddRange(products);
                await context.SaveChangesAsync();
            }
            if (!context.DeliveryMethods.Any())
            {
                var dmData = await File.ReadAllTextAsync(Path.Combine(path!, "Data", "SeedData", "delivery.json"));
                var methods = JsonSerializer.Deserialize<List<DeliveryMethod>>(dmData);

                if (methods == null) return;

                context.DeliveryMethods.AddRange(methods);
                await context.SaveChangesAsync();
            }
        }
    }
}
